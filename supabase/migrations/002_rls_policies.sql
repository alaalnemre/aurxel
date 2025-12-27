-- JordanMarket RLS Policies
-- Using capability flags (is_buyer, is_seller, is_driver, is_admin)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE topup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin capability
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user has seller capability
CREATE OR REPLACE FUNCTION is_seller(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND is_seller = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user has driver capability
CREATE OR REPLACE FUNCTION is_driver(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND is_driver = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Everyone can view profiles (for displaying seller/driver info)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for granting capabilities)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- =====================
-- SELLER PROFILES POLICIES
-- =====================

-- Anyone can view verified seller profiles
CREATE POLICY "Verified seller profiles are public"
  ON seller_profiles FOR SELECT
  USING (is_verified = TRUE OR auth.uid() = id OR is_admin(auth.uid()));

-- Sellers can manage their own seller profile
CREATE POLICY "Sellers can manage own seller profile"
  ON seller_profiles FOR ALL
  USING (auth.uid() = id);

-- Admins can manage all seller profiles
CREATE POLICY "Admins can manage seller profiles"
  ON seller_profiles FOR ALL
  USING (is_admin(auth.uid()));

-- =====================
-- DRIVER PROFILES POLICIES
-- =====================

-- Driver profiles visible to admins and owner
CREATE POLICY "Driver profiles viewable by owner and admin"
  ON driver_profiles FOR SELECT
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- Drivers can manage their own driver profile
CREATE POLICY "Drivers can manage own driver profile"
  ON driver_profiles FOR ALL
  USING (auth.uid() = id);

-- Admins can manage all driver profiles
CREATE POLICY "Admins can manage driver profiles"
  ON driver_profiles FOR ALL
  USING (is_admin(auth.uid()));

-- =====================
-- CATEGORIES POLICIES
-- =====================

-- Anyone can view active categories
CREATE POLICY "Active categories are public"
  ON categories FOR SELECT
  USING (is_active = TRUE OR is_admin(auth.uid()));

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin(auth.uid()));

-- =====================
-- PRODUCTS POLICIES
-- =====================

-- Anyone can view active products
CREATE POLICY "Active products are public"
  ON products FOR SELECT
  USING (is_active = TRUE OR auth.uid() = seller_id OR is_admin(auth.uid()));

-- Sellers can insert products
CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id AND is_seller(auth.uid()));

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id AND is_seller(auth.uid()))
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id AND is_seller(auth.uid()));

-- Admins can manage all products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin(auth.uid()));

-- =====================
-- ORDERS POLICIES
-- =====================

-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id AND is_seller(auth.uid()));

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update order status
CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id AND is_seller(auth.uid()));

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (is_admin(auth.uid()));

-- =====================
-- ORDER ITEMS POLICIES
-- =====================

-- Order items viewable by order participants
CREATE POLICY "Order items viewable by participants"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- Order items can be created with order
CREATE POLICY "Order items created with order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- =====================
-- DELIVERIES POLICIES
-- =====================

-- Drivers can view available deliveries
CREATE POLICY "Drivers can view available deliveries"
  ON deliveries FOR SELECT
  USING (
    (status = 'available' AND is_driver(auth.uid()))
    OR driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- Drivers can accept available deliveries
CREATE POLICY "Drivers can accept deliveries"
  ON deliveries FOR UPDATE
  USING (
    (status = 'available' AND is_driver(auth.uid()))
    OR (driver_id = auth.uid() AND is_driver(auth.uid()))
    OR is_admin(auth.uid())
  );

-- =====================
-- WALLETS POLICIES
-- =====================

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Wallets are created by trigger, no direct insert needed
-- Updates handled by server functions

-- =====================
-- TOPUP CODES POLICIES
-- =====================

-- Admins can manage topup codes
CREATE POLICY "Admins can manage topup codes"
  ON topup_codes FOR ALL
  USING (is_admin(auth.uid()));

-- Users can view codes they created or redeemed
CREATE POLICY "Users can view their topup codes"
  ON topup_codes FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = redeemed_by);

-- =====================
-- WALLET TRANSACTIONS POLICIES
-- =====================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
    OR is_admin(auth.uid())
  );

-- =====================
-- REVIEWS POLICIES
-- =====================

-- Reviews are public
CREATE POLICY "Reviews are public"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews for their completed orders
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'delivered'
    )
  );

-- =====================
-- DISPUTES POLICIES
-- =====================

-- Users can view disputes they raised or are involved in
CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = raised_by
    OR auth.uid() = assigned_to
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- Users can create disputes for their orders
CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Admins can update disputes
CREATE POLICY "Admins can manage disputes"
  ON disputes FOR UPDATE
  USING (is_admin(auth.uid()));
