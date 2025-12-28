-- =====================================================
-- 010_indexes.sql
-- Performance indexes for common queries
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX idx_profiles_seller_requested ON profiles(seller_requested) WHERE seller_requested = TRUE;
CREATE INDEX idx_profiles_driver_requested ON profiles(driver_requested) WHERE driver_requested = TRUE;

-- Sellers indexes
CREATE INDEX idx_sellers_profile_id ON sellers(profile_id);
CREATE INDEX idx_sellers_status ON sellers(status);

-- Drivers indexes
CREATE INDEX idx_drivers_profile_id ON drivers(profile_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_available ON drivers(available_for_delivery) WHERE available_for_delivery = TRUE;

-- Products indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_is_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Cart items indexes
CREATE INDEX idx_cart_items_profile_id ON cart_items(profile_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Orders indexes
CREATE INDEX idx_orders_buyer_profile_id ON orders(buyer_profile_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Deliveries indexes
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_available ON deliveries(status) WHERE status = 'available';

-- Disputes indexes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_opened_by ON disputes(opened_by);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Notifications indexes
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
