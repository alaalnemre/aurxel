-- =====================================================
-- 009_rls_policies.sql
-- Comprehensive Row Level Security policies
-- =====================================================

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- SELLERS POLICIES
-- =====================================================

-- Users can create seller request for themselves
CREATE POLICY "Users can create seller request"
  ON sellers FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can read their own seller record
CREATE POLICY "Users can read own seller record"
  ON sellers FOR SELECT
  USING (auth.uid() = profile_id);

-- Admin can read all sellers
CREATE POLICY "Admin can read all sellers"
  ON sellers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update any seller
CREATE POLICY "Admin can update any seller"
  ON sellers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Users can update their own seller (limited)
CREATE POLICY "Users can update own seller"
  ON sellers FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- =====================================================
-- DRIVERS POLICIES
-- =====================================================

-- Users can create driver request for themselves
CREATE POLICY "Users can create driver request"
  ON drivers FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can read their own driver record
CREATE POLICY "Users can read own driver record"
  ON drivers FOR SELECT
  USING (auth.uid() = profile_id);

-- Admin can read all drivers
CREATE POLICY "Admin can read all drivers"
  ON drivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update any driver
CREATE POLICY "Admin can update any driver"
  ON drivers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Users can update their own driver
CREATE POLICY "Users can update own driver"
  ON drivers FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Sellers can read all their products (including inactive)
CREATE POLICY "Sellers can read own products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = products.seller_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Sellers can create products
CREATE POLICY "Sellers can create products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = seller_id 
      AND sellers.profile_id = auth.uid()
      AND sellers.status = 'approved'
    )
  );

-- Sellers can update their products
CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = products.seller_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Sellers can delete their products
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = products.seller_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Admin can read all products
CREATE POLICY "Admin can read all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- CART_ITEMS POLICIES
-- =====================================================

-- Users can read their own cart items
CREATE POLICY "Users can read own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = profile_id);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Buyers can read their own orders
CREATE POLICY "Buyers can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_profile_id);

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_profile_id);

-- Buyers can update own orders (limited - for cancellation)
CREATE POLICY "Buyers can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_profile_id AND status = 'placed');

-- Sellers can read orders for their store
CREATE POLICY "Sellers can read own store orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = orders.seller_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Sellers can update orders for their store
CREATE POLICY "Sellers can update own store orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sellers 
      WHERE sellers.id = orders.seller_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Drivers can read orders linked to their deliveries
CREATE POLICY "Drivers can read assigned orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      JOIN drivers ON drivers.id = deliveries.driver_id
      WHERE deliveries.order_id = orders.id 
      AND drivers.profile_id = auth.uid()
    )
  );

-- Drivers can update orders they're delivering
CREATE POLICY "Drivers can update assigned orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      JOIN drivers ON drivers.id = deliveries.driver_id
      WHERE deliveries.order_id = orders.id 
      AND drivers.profile_id = auth.uid()
    )
  );

-- Admin can read all orders
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update all orders
CREATE POLICY "Admin can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- ORDER_ITEMS POLICIES
-- =====================================================

-- Buyers can read their order items
CREATE POLICY "Buyers can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.buyer_profile_id = auth.uid()
    )
  );

-- Buyers can create order items
CREATE POLICY "Buyers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.buyer_profile_id = auth.uid()
    )
  );

-- Sellers can read order items for their orders
CREATE POLICY "Sellers can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN sellers ON sellers.id = orders.seller_id
      WHERE orders.id = order_items.order_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Drivers can read order items for assigned orders
CREATE POLICY "Drivers can read assigned order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN deliveries ON deliveries.order_id = orders.id
      JOIN drivers ON drivers.id = deliveries.driver_id
      WHERE orders.id = order_items.order_id 
      AND drivers.profile_id = auth.uid()
    )
  );

-- Admin can read all order items
CREATE POLICY "Admin can read all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- DELIVERIES POLICIES
-- =====================================================

-- Drivers can see available deliveries
CREATE POLICY "Drivers can see available deliveries"
  ON deliveries FOR SELECT
  USING (
    status = 'available' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND driver_verified = TRUE
    )
  );

-- Drivers can see their assigned deliveries
CREATE POLICY "Drivers can see assigned deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = deliveries.driver_id 
      AND drivers.profile_id = auth.uid()
    )
  );

-- Drivers can update their assigned deliveries
CREATE POLICY "Drivers can update assigned deliveries"
  ON deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = deliveries.driver_id 
      AND drivers.profile_id = auth.uid()
    )
  );

-- Drivers can accept available deliveries
CREATE POLICY "Drivers can accept deliveries"
  ON deliveries FOR UPDATE
  USING (
    status = 'available' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND driver_verified = TRUE
    )
  );

-- Buyers can see delivery for their order
CREATE POLICY "Buyers can see own delivery"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.buyer_profile_id = auth.uid()
    )
  );

-- Sellers can see delivery for their orders
CREATE POLICY "Sellers can see own delivery"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN sellers ON sellers.id = orders.seller_id
      WHERE orders.id = deliveries.order_id 
      AND sellers.profile_id = auth.uid()
    )
  );

-- Admin can read all deliveries
CREATE POLICY "Admin can read all deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update all deliveries
CREATE POLICY "Admin can update all deliveries"
  ON deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create deliveries when order is created
CREATE POLICY "System can create deliveries"
  ON deliveries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.buyer_profile_id = auth.uid()
    )
  );

-- =====================================================
-- DISPUTES POLICIES
-- =====================================================

-- Users can see disputes they opened
CREATE POLICY "Users can see own disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = opened_by);

-- Users can create disputes
CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = opened_by);

-- Admin can read all disputes
CREATE POLICY "Admin can read all disputes"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update disputes
CREATE POLICY "Admin can update disputes"
  ON disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can see their own notifications
CREATE POLICY "Users can see own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- System/Admin can create notifications
CREATE POLICY "Admin can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
    OR auth.uid() = profile_id
  );

-- Admin can read all notifications
CREATE POLICY "Admin can read all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
