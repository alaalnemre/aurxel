-- =====================================================
-- 015_order_commissions.sql
-- Order commissions tracking for platform revenue
-- =====================================================

-- Order commissions table
CREATE TABLE IF NOT EXISTS order_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  order_total NUMERIC(10,2) NOT NULL CHECK (order_total >= 0),
  commission_rate_snapshot NUMERIC(5,2) NOT NULL CHECK (commission_rate_snapshot >= 0 AND commission_rate_snapshot <= 100),
  commission_amount NUMERIC(10,2) NOT NULL CHECK (commission_amount >= 0),
  platform_revenue NUMERIC(10,2) NOT NULL CHECK (platform_revenue >= 0),
  seller_earnings NUMERIC(10,2) NOT NULL CHECK (seller_earnings >= 0),
  is_settled BOOLEAN DEFAULT FALSE NOT NULL,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE order_commissions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_commissions_seller_id ON order_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_commissions_is_settled ON order_commissions(is_settled);
CREATE INDEX IF NOT EXISTS idx_order_commissions_created_at ON order_commissions(created_at DESC);

-- Add commission_rate to sellers table (default 10%)
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- Add seller_activated_at to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS seller_activated_at TIMESTAMPTZ;

-- Function to calculate and insert commission when order is completed
CREATE OR REPLACE FUNCTION calculate_order_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_seller sellers%ROWTYPE;
  v_commission_amount NUMERIC(10,2);
  v_seller_earnings NUMERIC(10,2);
BEGIN
  -- Only calculate when order transitions to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get seller details
    SELECT * INTO v_seller FROM sellers WHERE id = NEW.seller_id;
    
    IF v_seller IS NOT NULL THEN
      -- Calculate commission
      v_commission_amount := ROUND((NEW.subtotal * v_seller.commission_rate / 100), 2);
      v_seller_earnings := NEW.subtotal - v_commission_amount;
      
      -- Insert commission record (ignore if already exists)
      INSERT INTO order_commissions (
        order_id,
        seller_id,
        order_total,
        commission_rate_snapshot,
        commission_amount,
        platform_revenue,
        seller_earnings
      ) VALUES (
        NEW.id,
        NEW.seller_id,
        NEW.subtotal,
        v_seller.commission_rate,
        v_commission_amount,
        v_commission_amount,
        v_seller_earnings
      )
      ON CONFLICT (order_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for commission calculation
DROP TRIGGER IF EXISTS trigger_calculate_order_commission ON orders;
CREATE TRIGGER trigger_calculate_order_commission
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_commission();
