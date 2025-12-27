-- JordanMarket Monetization Layer Migration
-- Adds platform fee tracking, seller payouts, and sponsored listings support
-- SAFE: All changes are additive, no breaking changes

-- =====================================================
-- PART 1: ORDERS TABLE - Add monetization fields
-- =====================================================

-- Add platform fee and seller payout columns to orders
-- These are calculated and stored when order is COMPLETED (delivered)
-- Values are IMMUTABLE once set - historical orders unaffected by fee changes
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seller_payout NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS platform_fee_rate NUMERIC(5,4) DEFAULT NULL; -- Snapshot of fee rate at completion

-- =====================================================
-- PART 2: PRODUCTS TABLE - Add sponsored listing field
-- =====================================================

-- Add is_sponsored flag for featured product listings
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMPTZ DEFAULT NULL; -- Optional: expiry date for sponsorship

-- =====================================================
-- PART 3: PLATFORM SETTINGS TABLE - Configurable fees
-- =====================================================

-- Create platform_settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default platform fee (5%)
INSERT INTO platform_settings (key, value, description)
VALUES (
  'platform_fee_rate',
  '0.05',
  'Platform commission rate applied to completed orders (decimal, e.g., 0.05 = 5%)'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default delivery pricing
INSERT INTO platform_settings (key, value, description)
VALUES (
  'default_delivery_fee',
  '2.00',
  'Default delivery fee in JOD'
)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PART 4: RLS POLICIES FOR PLATFORM SETTINGS
-- =====================================================

-- Enable RLS on platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform settings
CREATE POLICY "Admins can view platform settings"
ON platform_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
ON platform_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);

-- Only admins can insert platform settings
CREATE POLICY "Admins can insert platform settings"
ON platform_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);

-- =====================================================
-- PART 5: FUNCTION TO CALCULATE & STORE MONETIZATION
-- =====================================================

-- Function to calculate and store platform fee when order is completed
-- Called when order status changes to 'delivered'
CREATE OR REPLACE FUNCTION calculate_order_monetization()
RETURNS TRIGGER AS $$
DECLARE
  fee_rate NUMERIC(5,4);
  calculated_fee NUMERIC(10,2);
  calculated_payout NUMERIC(10,2);
BEGIN
  -- Only calculate when order becomes delivered AND fee not already set
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.platform_fee IS NULL THEN
    -- Get current platform fee rate from settings
    SELECT COALESCE(value::NUMERIC, 0.05) INTO fee_rate
    FROM platform_settings
    WHERE key = 'platform_fee_rate';
    
    -- Default to 5% if not found
    IF fee_rate IS NULL THEN
      fee_rate := 0.05;
    END IF;
    
    -- Calculate platform fee based on order total (excluding delivery fee)
    calculated_fee := ROUND(NEW.total_amount * fee_rate, 2);
    calculated_payout := NEW.total_amount - calculated_fee;
    
    -- Store the values (immutable once set)
    NEW.platform_fee := calculated_fee;
    NEW.seller_payout := calculated_payout;
    NEW.platform_fee_rate := fee_rate;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-calculate on status change
DROP TRIGGER IF EXISTS trigger_order_monetization ON orders;
CREATE TRIGGER trigger_order_monetization
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION calculate_order_monetization();

-- =====================================================
-- PART 6: INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for querying completed orders with payouts
CREATE INDEX IF NOT EXISTS idx_orders_seller_payout ON orders(seller_id, seller_payout) WHERE status = 'delivered';

-- Index for sponsored products
CREATE INDEX IF NOT EXISTS idx_products_sponsored ON products(is_sponsored) WHERE is_sponsored = TRUE;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON COLUMN orders.platform_fee IS 'Platform commission amount (JOD). Set automatically when order delivered.';
COMMENT ON COLUMN orders.seller_payout IS 'Net amount payable to seller (total_amount - platform_fee). Set automatically when order delivered.';
COMMENT ON COLUMN orders.platform_fee_rate IS 'Snapshot of platform fee rate at time of order completion (e.g., 0.05 = 5%). Immutable.';
COMMENT ON COLUMN products.is_sponsored IS 'Whether product appears as sponsored/featured in listings.';
COMMENT ON COLUMN products.sponsored_until IS 'Optional expiry time for sponsored status.';
COMMENT ON TABLE platform_settings IS 'Admin-configurable platform settings. Key-value store with audit trail.';
