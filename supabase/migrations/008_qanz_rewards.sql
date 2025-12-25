-- =====================================================
-- JordanMarket Database Schema - Phase 9
-- QANZ Rewards (Loyalty & Incentives)
-- =====================================================

-- =====================================================
-- ADD 'reward' TYPE TO QANZ_TRANSACTION_TYPE IF NEEDED
-- =====================================================

-- Note: We'll use 'topup' type for rewards since it's a credit
-- Or add reward type if it exists:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'reward' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'qanz_transaction_type')
  ) THEN
    ALTER TYPE qanz_transaction_type ADD VALUE 'reward';
  END IF;
END$$;

-- =====================================================
-- QANZ REWARD RULES TABLE
-- =====================================================

CREATE TABLE qanz_reward_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qanz_reward_rules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QANZ REWARD EVENTS TABLE (IDEMPOTENCY)
-- =====================================================

CREATE TABLE qanz_reward_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issued_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint ensures no duplicate rewards
  UNIQUE(reference_type, reference_id, user_id, key)
);

-- Enable RLS
ALTER TABLE qanz_reward_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR REWARD RULES
-- =====================================================

-- Anyone can read active rules
CREATE POLICY "Anyone can read active reward rules"
  ON qanz_reward_rules FOR SELECT
  USING (is_active = TRUE);

-- Admin can read all rules
CREATE POLICY "Admin can read all reward rules"
  ON qanz_reward_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update rules
CREATE POLICY "Admin can update reward rules"
  ON qanz_reward_rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR REWARD EVENTS
-- =====================================================

-- Users can read their own reward events
CREATE POLICY "Users can read own reward events"
  ON qanz_reward_events FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all reward events
CREATE POLICY "Admin can read all reward events"
  ON qanz_reward_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- SEED DEFAULT REWARD RULES
-- =====================================================

INSERT INTO qanz_reward_rules (key, title_en, title_ar, amount, is_active) VALUES
  ('buyer_order_delivered', 'Order Delivery Reward', 'مكافأة توصيل الطلب', 2.00, TRUE),
  ('driver_delivery_delivered', 'Delivery Completion Reward', 'مكافأة إكمال التوصيل', 3.00, TRUE),
  ('seller_order_delivered', 'Sale Completion Reward', 'مكافأة إتمام البيع', 1.00, TRUE)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- FUNCTION: Issue QANZ Reward (IDEMPOTENT)
-- =====================================================

CREATE OR REPLACE FUNCTION issue_qanz_reward(
  p_key TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT, issued_amount NUMERIC) AS $$
DECLARE
  v_rule RECORD;
  v_event_id UUID;
BEGIN
  -- Get active rule
  SELECT id, amount, title_en
  INTO v_rule
  FROM qanz_reward_rules
  WHERE key = p_key AND is_active = TRUE;

  IF v_rule.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Rule not found or inactive'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Try to insert reward event (unique constraint ensures idempotency)
  BEGIN
    INSERT INTO qanz_reward_events (
      key,
      reference_type,
      reference_id,
      user_id,
      issued_amount
    ) VALUES (
      p_key,
      p_reference_type,
      p_reference_id,
      p_user_id,
      v_rule.amount
    )
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN unique_violation THEN
    -- Already issued, return success but with 0 amount
    RETURN QUERY SELECT TRUE, 'Reward already issued'::TEXT, 0::NUMERIC;
    RETURN;
  END;

  -- Insert ledger credit
  INSERT INTO qanz_ledger (
    user_id,
    type,
    amount,
    reference_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    'reward',
    v_rule.amount,
    'reward',
    v_event_id,
    v_rule.title_en
  );

  -- Create notification
  PERFORM create_notification(
    p_user_id,
    'qanz_reward',
    'You earned QANZ!',
    'You earned ' || v_rule.amount || ' QANZ for completing your ' || p_reference_type || '!',
    'reward',
    v_event_id
  );

  RETURN QUERY SELECT TRUE, 'Reward issued successfully'::TEXT, v_rule.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Issue rewards on delivery delivered
-- =====================================================

CREATE OR REPLACE FUNCTION issue_delivery_rewards()
RETURNS TRIGGER AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
    -- Get order details
    SELECT id, buyer_id, seller_id INTO v_order
    FROM orders WHERE id = NEW.order_id;

    -- Issue buyer reward
    IF v_order.buyer_id IS NOT NULL THEN
      PERFORM issue_qanz_reward(
        'buyer_order_delivered',
        'order',
        v_order.id,
        v_order.buyer_id
      );
    END IF;

    -- Issue driver reward
    IF NEW.driver_id IS NOT NULL THEN
      PERFORM issue_qanz_reward(
        'driver_delivery_delivered',
        'delivery',
        NEW.id,
        NEW.driver_id
      );
    END IF;

    -- Issue seller reward
    IF v_order.seller_id IS NOT NULL THEN
      PERFORM issue_qanz_reward(
        'seller_order_delivered',
        'order',
        v_order.id,
        v_order.seller_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER issue_rewards_on_delivery
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION issue_delivery_rewards();

-- =====================================================
-- UPDATED_AT TRIGGER FOR RULES
-- =====================================================

CREATE TRIGGER qanz_reward_rules_updated_at
  BEFORE UPDATE ON qanz_reward_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_qanz_reward_events_user_id ON qanz_reward_events(user_id);
CREATE INDEX idx_qanz_reward_events_key ON qanz_reward_events(key);
CREATE INDEX idx_qanz_reward_events_created_at ON qanz_reward_events(created_at DESC);
CREATE INDEX idx_qanz_reward_rules_key ON qanz_reward_rules(key);
CREATE INDEX idx_qanz_reward_rules_is_active ON qanz_reward_rules(is_active);
