-- =====================================================
-- 018_discount_redemptions.sql
-- Discount redemption tracking and order integration
-- =====================================================

-- Discount redemptions table (tracks usage)
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Snapshot of discount at redemption time
  discount_value_applied NUMERIC(10,2) NOT NULL CHECK (discount_value_applied >= 0),
  
  -- Timestamp
  redeemed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: one discount per order
  CONSTRAINT unique_discount_per_order UNIQUE (discount_id, order_id)
);

-- Enable RLS
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_discount_id ON discount_redemptions(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_profile_id ON discount_redemptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_order_id ON discount_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_redeemed_at ON discount_redemptions(redeemed_at DESC);

-- Add discount columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0 NOT NULL CHECK (discount_amount >= 0);

-- Index on orders for discount lookups
CREATE INDEX IF NOT EXISTS idx_orders_discount_code_id ON orders(discount_code_id);

-- Function to increment discount usage count
CREATE OR REPLACE FUNCTION increment_discount_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE discount_codes 
  SET current_uses = current_uses + 1 
  WHERE id = NEW.discount_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_increment_discount_usage ON discount_redemptions;
CREATE TRIGGER trigger_increment_discount_usage
  AFTER INSERT ON discount_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION increment_discount_usage();

-- Function to decrement discount usage on rollback
CREATE OR REPLACE FUNCTION decrement_discount_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE discount_codes 
  SET current_uses = GREATEST(0, current_uses - 1) 
  WHERE id = OLD.discount_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trigger_decrement_discount_usage ON discount_redemptions;
CREATE TRIGGER trigger_decrement_discount_usage
  AFTER DELETE ON discount_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION decrement_discount_usage();
