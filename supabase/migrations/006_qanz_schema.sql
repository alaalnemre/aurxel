-- =====================================================
-- JordanMarket Database Schema - Phase 7
-- QANZ Currency (Top-Up Codes + Ledger)
-- =====================================================

-- =====================================================
-- TOPUP CODE STATUS ENUM
-- =====================================================

CREATE TYPE topup_code_status AS ENUM (
  'active',
  'redeemed',
  'voided'
);

-- =====================================================
-- QANZ TRANSACTION TYPE ENUM
-- =====================================================

CREATE TYPE qanz_transaction_type AS ENUM (
  'topup',
  'spend',
  'refund',
  'admin_adjustment'
);

-- =====================================================
-- QANZ TOPUP CODES TABLE
-- =====================================================

CREATE TABLE qanz_topup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status topup_code_status NOT NULL DEFAULT 'active',
  
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  redeemed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qanz_topup_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QANZ LEDGER TABLE (APPEND-ONLY)
-- =====================================================

CREATE TABLE qanz_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type qanz_transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL, -- positive for credit, negative for debit
  
  reference_type TEXT, -- 'topup_code', 'order', 'admin'
  reference_id UUID,
  description TEXT,
  
  created_by UUID REFERENCES profiles(id), -- admin/system
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qanz_ledger ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QANZ BALANCE VIEW (COMPUTED FROM LEDGER)
-- =====================================================

CREATE OR REPLACE VIEW qanz_balance_view AS
SELECT 
  user_id,
  COALESCE(SUM(amount), 0) AS balance
FROM qanz_ledger
GROUP BY user_id;

-- =====================================================
-- RLS POLICIES FOR TOPUP CODES
-- =====================================================

-- Admin can read all codes
CREATE POLICY "Admin can read all topup codes"
  ON qanz_topup_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert codes
CREATE POLICY "Admin can create topup codes"
  ON qanz_topup_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update codes (for voiding)
CREATE POLICY "Admin can update topup codes"
  ON qanz_topup_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR LEDGER
-- =====================================================

-- Users can read their own ledger entries
CREATE POLICY "Users can read own ledger entries"
  ON qanz_ledger FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all ledger entries
CREATE POLICY "Admin can read all ledger entries"
  ON qanz_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert ledger entries (for adjustments)
CREATE POLICY "Admin can insert ledger entries"
  ON qanz_ledger FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGER FOR TOPUP CODES
-- =====================================================

CREATE TRIGGER qanz_topup_codes_updated_at
  BEFORE UPDATE ON qanz_topup_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- FUNCTION: Generate random topup code
-- =====================================================

CREATE OR REPLACE FUNCTION generate_qanz_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 12-character code in format XXXX-XXXX-XXXX
  FOR i IN 1..12 LOOP
    result := result || substr(chars, (random() * length(chars) + 1)::integer, 1);
    IF i = 4 OR i = 8 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Redeem topup code (ATOMIC, SECURITY DEFINER)
-- =====================================================

CREATE OR REPLACE FUNCTION redeem_qanz_code(p_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE
  v_code_id UUID;
  v_amount NUMERIC(10,2);
  v_user_id UUID;
  v_balance NUMERIC(10,2);
BEGIN
  -- Get calling user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Not authenticated'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Lock and validate the code
  SELECT id, amount
  INTO v_code_id, v_amount
  FROM qanz_topup_codes
  WHERE code = p_code AND status = 'active'
  FOR UPDATE;

  IF v_code_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid or already used code'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Update code status
  UPDATE qanz_topup_codes
  SET 
    status = 'redeemed',
    redeemed_by = v_user_id,
    redeemed_at = NOW()
  WHERE id = v_code_id;

  -- Insert ledger credit
  INSERT INTO qanz_ledger (
    user_id,
    type,
    amount,
    reference_type,
    reference_id,
    description
  ) VALUES (
    v_user_id,
    'topup',
    v_amount,
    'topup_code',
    v_code_id,
    'Top-up code redemption'
  );

  -- Calculate new balance
  SELECT COALESCE(SUM(amount), 0)
  INTO v_balance
  FROM qanz_ledger
  WHERE user_id = v_user_id;

  RETURN QUERY SELECT TRUE, 'Code redeemed successfully'::TEXT, v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get user balance
-- =====================================================

CREATE OR REPLACE FUNCTION get_qanz_balance(p_user_id UUID DEFAULT NULL)
RETURNS NUMERIC AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC(10,2);
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT COALESCE(SUM(amount), 0)
  INTO v_balance
  FROM qanz_ledger
  WHERE user_id = v_user_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Spend QANZ (for future checkout)
-- =====================================================

CREATE OR REPLACE FUNCTION spend_qanz(
  p_amount NUMERIC,
  p_order_id UUID,
  p_description TEXT DEFAULT 'Order payment'
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC(10,2);
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Not authenticated'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Get current balance
  SELECT COALESCE(SUM(amount), 0)
  INTO v_balance
  FROM qanz_ledger
  WHERE user_id = v_user_id;

  IF v_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'Insufficient balance'::TEXT, v_balance;
    RETURN;
  END IF;

  -- Insert ledger debit
  INSERT INTO qanz_ledger (
    user_id,
    type,
    amount,
    reference_type,
    reference_id,
    description
  ) VALUES (
    v_user_id,
    'spend',
    -p_amount, -- negative for debit
    'order',
    p_order_id,
    p_description
  );

  -- Calculate new balance
  v_balance := v_balance - p_amount;

  RETURN QUERY SELECT TRUE, 'Payment successful'::TEXT, v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_qanz_topup_codes_code ON qanz_topup_codes(code);
CREATE INDEX idx_qanz_topup_codes_status ON qanz_topup_codes(status);
CREATE INDEX idx_qanz_topup_codes_created_by ON qanz_topup_codes(created_by);
CREATE INDEX idx_qanz_topup_codes_created_at ON qanz_topup_codes(created_at DESC);

CREATE INDEX idx_qanz_ledger_user_id ON qanz_ledger(user_id);
CREATE INDEX idx_qanz_ledger_type ON qanz_ledger(type);
CREATE INDEX idx_qanz_ledger_created_at ON qanz_ledger(created_at DESC);
CREATE INDEX idx_qanz_ledger_reference ON qanz_ledger(reference_type, reference_id);
