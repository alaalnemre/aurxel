-- =====================================================
-- 017_discount_codes.sql
-- Discount codes system for marketing campaigns
-- =====================================================

-- Discount type enum
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Code identification (always uppercase)
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Discount configuration
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  
  -- Usage limits (null = unlimited)
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  max_uses_per_user INTEGER CHECK (max_uses_per_user IS NULL OR max_uses_per_user > 0),
  current_uses INTEGER DEFAULT 0 NOT NULL CHECK (current_uses >= 0),
  
  -- Order requirements
  min_order_amount NUMERIC(10,2) CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
  
  -- Validity period
  starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ends_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (ends_at IS NULL OR ends_at > starts_at),
  CONSTRAINT valid_percentage CHECK (
    discount_type != 'percentage' OR (discount_value > 0 AND discount_value <= 100)
  )
);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_dates ON discount_codes(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_discount_codes_created_by ON discount_codes(created_by);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_discount_codes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER trigger_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_codes_updated_at();

-- Ensure code is always uppercase
CREATE OR REPLACE FUNCTION normalize_discount_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_normalize_discount_code ON discount_codes;
CREATE TRIGGER trigger_normalize_discount_code
  BEFORE INSERT OR UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION normalize_discount_code();
