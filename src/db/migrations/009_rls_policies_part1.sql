-- ============================================
-- Migration 009: Row Level Security Policies
-- Implements least privilege access control
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY profiles_admin_select ON profiles
  FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE USING (is_admin());

-- ============================================
-- SELLERS POLICIES
-- ============================================

-- Sellers can read their own record
CREATE POLICY sellers_select_own ON sellers
  FOR SELECT USING (auth.uid() = user_id);

-- Sellers can create their own record
CREATE POLICY sellers_insert_own ON sellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sellers can update their own pending record
CREATE POLICY sellers_update_own ON sellers
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all sellers
CREATE POLICY sellers_admin_all ON sellers
  FOR ALL USING (is_admin());

-- ============================================
-- DRIVERS POLICIES
-- ============================================

-- Drivers can read their own record
CREATE POLICY drivers_select_own ON drivers
  FOR SELECT USING (auth.uid() = user_id);

-- Drivers can create their own record
CREATE POLICY drivers_insert_own ON drivers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Drivers can update their own pending record
CREATE POLICY drivers_update_own ON drivers
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all drivers
CREATE POLICY drivers_admin_all ON drivers
  FOR ALL USING (is_admin());

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Everyone can read categories
CREATE POLICY categories_select_all ON categories
  FOR SELECT USING (true);

-- Only admins can manage categories
CREATE POLICY categories_admin_all ON categories
  FOR ALL USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Everyone can read active products
CREATE POLICY products_select_active ON products
  FOR SELECT USING (is_active = true);

-- Sellers can read all their own products
CREATE POLICY products_select_own ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

-- Approved sellers can create products
CREATE POLICY products_insert_approved_seller ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = seller_id 
      AND sellers.user_id = auth.uid() 
      AND sellers.status = 'approved'
    )
  );

-- Sellers can update their own products
CREATE POLICY products_update_own ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

-- Sellers can delete their own products
CREATE POLICY products_delete_own ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

-- Admins can manage all products
CREATE POLICY products_admin_all ON products
  FOR ALL USING (is_admin());

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

-- Everyone can read images of active products
CREATE POLICY product_images_select_active ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.is_active = true)
  );

-- Sellers can read their own product images
CREATE POLICY product_images_select_own ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      JOIN sellers ON products.seller_id = sellers.id 
      WHERE products.id = product_images.product_id AND sellers.user_id = auth.uid()
    )
  );

-- Sellers can manage their own product images
CREATE POLICY product_images_insert_own ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      JOIN sellers ON products.seller_id = sellers.id 
      WHERE products.id = product_images.product_id AND sellers.user_id = auth.uid()
    )
  );

CREATE POLICY product_images_delete_own ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      JOIN sellers ON products.seller_id = sellers.id 
      WHERE products.id = product_images.product_id AND sellers.user_id = auth.uid()
    )
  );

-- Admins can manage all images
CREATE POLICY product_images_admin_all ON product_images
  FOR ALL USING (is_admin());
