-- =====================================================
-- 019_rls_discounts.sql
-- Row Level Security policies for discount system
-- =====================================================

-- =====================================================
-- DISCOUNT CODES RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to discount_codes" ON discount_codes;
DROP POLICY IF EXISTS "Buyers can view active discount codes" ON discount_codes;

-- Admin: Full access to discount_codes
CREATE POLICY "Admin full access to discount_codes"
  ON discount_codes
  FOR ALL
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

-- Buyers: Can view active, valid discount codes (for validation)
CREATE POLICY "Buyers can view active discount codes"
  ON discount_codes
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND starts_at <= NOW()
    AND (ends_at IS NULL OR ends_at > NOW())
  );

-- =====================================================
-- DISCOUNT REDEMPTIONS RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to discount_redemptions" ON discount_redemptions;
DROP POLICY IF EXISTS "Buyers can view own redemptions" ON discount_redemptions;
DROP POLICY IF EXISTS "Buyers can insert own redemptions" ON discount_redemptions;

-- Admin: Full access to discount_redemptions
CREATE POLICY "Admin full access to discount_redemptions"
  ON discount_redemptions
  FOR ALL
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

-- Buyers: Can view their own redemptions
CREATE POLICY "Buyers can view own redemptions"
  ON discount_redemptions
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Buyers: Can insert redemptions for their own orders
CREATE POLICY "Buyers can insert own redemptions"
  ON discount_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.buyer_profile_id = auth.uid()
    )
  );

-- =====================================================
-- UPDATE ORDERS RLS for discount columns
-- =====================================================

-- Note: Existing orders RLS should already allow buyers to create orders
-- The discount columns are set during order creation, so no additional
-- policies are strictly needed. The server action will handle validation.
