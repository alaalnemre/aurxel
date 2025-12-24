-- ============================================
-- Migration 005: Wallet System
-- QANZ currency with wallet accounts, transactions, and top-up codes
-- ============================================

-- ============================================
-- WALLET ACCOUNTS TABLE
-- One wallet per user
-- ============================================

CREATE TABLE wallet_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallet_accounts_owner ON wallet_accounts(owner_id);

-- Auto-update updated_at
CREATE TRIGGER update_wallet_accounts_updated_at
  BEFORE UPDATE ON wallet_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WALLET TRANSACTIONS TABLE
-- All wallet movements with full audit trail
-- ============================================

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE RESTRICT,
  type wallet_transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  ref_table TEXT,
  ref_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallet_transactions_account ON wallet_transactions(account_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_ref ON wallet_transactions(ref_table, ref_id);

-- ============================================
-- TOP-UP CODES TABLE
-- Admin-issued redeemable codes
-- ============================================

CREATE TABLE topup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status topup_code_status NOT NULL DEFAULT 'active',
  issued_by_admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  redeemed_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_topup_codes_code ON topup_codes(code);
CREATE INDEX idx_topup_codes_status ON topup_codes(status);
CREATE INDEX idx_topup_codes_issued_by ON topup_codes(issued_by_admin_id);
CREATE INDEX idx_topup_codes_redeemed_by ON topup_codes(redeemed_by_user_id);

-- ============================================
-- AUTO-CREATE WALLET ON PROFILE CREATE
-- ============================================

CREATE OR REPLACE FUNCTION auto_create_wallet_for_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallet_accounts (owner_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION auto_create_wallet_for_profile();
