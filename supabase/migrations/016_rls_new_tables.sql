-- =====================================================
-- 016_rls_new_tables.sql
-- RLS policies for all new tables
-- =====================================================

-- =====================================================
-- WALLETS RLS
-- =====================================================

-- Users can view their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = profile_id);

-- Admins can view all wallets
DROP POLICY IF EXISTS "Admins can view all wallets" ON wallets;
CREATE POLICY "Admins can view all wallets" ON wallets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Only system (via functions) can insert/update wallets
DROP POLICY IF EXISTS "System can manage wallets" ON wallets;
CREATE POLICY "System can manage wallets" ON wallets
  FOR ALL USING (FALSE) WITH CHECK (FALSE);

-- =====================================================
-- WALLET TRANSACTIONS RLS
-- =====================================================

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (
    wallet_id IN (SELECT id FROM wallets WHERE profile_id = auth.uid())
  );

-- Admins can view all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON wallet_transactions;
CREATE POLICY "Admins can view all transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =====================================================
-- PAYOUTS RLS
-- =====================================================

-- Sellers can view their own payouts
DROP POLICY IF EXISTS "Sellers can view own payouts" ON payouts;
CREATE POLICY "Sellers can view own payouts" ON payouts
  FOR SELECT USING (
    seller_id IN (SELECT id FROM sellers WHERE profile_id = auth.uid())
  );

-- Sellers can request payouts
DROP POLICY IF EXISTS "Sellers can request payouts" ON payouts;
CREATE POLICY "Sellers can request payouts" ON payouts
  FOR INSERT WITH CHECK (
    seller_id IN (SELECT id FROM sellers WHERE profile_id = auth.uid())
  );

-- Admins can view all payouts
DROP POLICY IF EXISTS "Admins can view all payouts" ON payouts;
CREATE POLICY "Admins can view all payouts" ON payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Admins can update payouts (process them)
DROP POLICY IF EXISTS "Admins can update payouts" ON payouts;
CREATE POLICY "Admins can update payouts" ON payouts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =====================================================
-- REVIEWS RLS
-- =====================================================

-- Anyone can view visible reviews
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
CREATE POLICY "Anyone can view visible reviews" ON reviews
  FOR SELECT USING (is_visible = TRUE);

-- Buyers can create reviews for their completed orders
DROP POLICY IF EXISTS "Buyers can create reviews" ON reviews;
CREATE POLICY "Buyers can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    buyer_profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND buyer_profile_id = auth.uid() 
      AND status = 'completed'
    )
  );

-- Buyers can update their own reviews
DROP POLICY IF EXISTS "Buyers can update own reviews" ON reviews;
CREATE POLICY "Buyers can update own reviews" ON reviews
  FOR UPDATE USING (buyer_profile_id = auth.uid());

-- Admins can manage all reviews
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =====================================================
-- PRODUCT VARIANTS RLS
-- =====================================================

-- Anyone can view active variants of active products
DROP POLICY IF EXISTS "Anyone can view active variants" ON product_variants;
CREATE POLICY "Anyone can view active variants" ON product_variants
  FOR SELECT USING (
    is_active = TRUE
    AND EXISTS (SELECT 1 FROM products WHERE id = product_id AND is_active = TRUE)
  );

-- Sellers can view all their variants
DROP POLICY IF EXISTS "Sellers can view own variants" ON product_variants;
CREATE POLICY "Sellers can view own variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = product_id AND s.profile_id = auth.uid()
    )
  );

-- Sellers can create variants for their products
DROP POLICY IF EXISTS "Sellers can create variants" ON product_variants;
CREATE POLICY "Sellers can create variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = product_id AND s.profile_id = auth.uid()
    )
  );

-- Sellers can update their variants
DROP POLICY IF EXISTS "Sellers can update variants" ON product_variants;
CREATE POLICY "Sellers can update variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = product_id AND s.profile_id = auth.uid()
    )
  );

-- Sellers can delete their variants
DROP POLICY IF EXISTS "Sellers can delete variants" ON product_variants;
CREATE POLICY "Sellers can delete variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = product_id AND s.profile_id = auth.uid()
    )
  );

-- =====================================================
-- ORDER COMMISSIONS RLS
-- =====================================================

-- Sellers can view their own commissions
DROP POLICY IF EXISTS "Sellers can view own commissions" ON order_commissions;
CREATE POLICY "Sellers can view own commissions" ON order_commissions
  FOR SELECT USING (
    seller_id IN (SELECT id FROM sellers WHERE profile_id = auth.uid())
  );

-- Admins can view all commissions
DROP POLICY IF EXISTS "Admins can view all commissions" ON order_commissions;
CREATE POLICY "Admins can view all commissions" ON order_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Admins can update commissions (settle them)
DROP POLICY IF EXISTS "Admins can update commissions" ON order_commissions;
CREATE POLICY "Admins can update commissions" ON order_commissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
