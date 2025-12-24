-- ============================================
-- Migration 003: Shopping Schema
-- Carts, cart items, orders, order items, deliveries
-- ============================================

-- ============================================
-- CARTS TABLE
-- Shopping carts for buyers
-- ============================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_carts_buyer_id ON carts(buyer_id);

-- Auto-update updated_at
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CART ITEMS TABLE
-- Items in shopping carts
-- ============================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Indexes
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- ORDERS TABLE
-- Customer orders (COD only)
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending_seller',
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDER ITEMS TABLE
-- Individual items in an order (denormalized for history)
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  title_snapshot TEXT NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL CHECK (price_snapshot >= 0),
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- DELIVERIES TABLE
-- Delivery assignments and tracking
-- ============================================

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status delivery_status NOT NULL DEFAULT 'available',
  pickup_address TEXT NOT NULL,
  pickup_phone TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_phone TEXT NOT NULL,
  cod_amount DECIMAL(10,2) NOT NULL CHECK (cod_amount >= 0),
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- ============================================
-- AUTO-COMPLETE ORDER ON DELIVERY
-- When delivery status becomes 'delivered', set order to 'completed'
-- ============================================

CREATE OR REPLACE FUNCTION auto_complete_order_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE orders SET status = 'completed', updated_at = NOW()
    WHERE id = NEW.order_id AND status != 'completed';
    
    NEW.delivered_at = NOW();
  END IF;
  
  IF NEW.status = 'assigned' AND OLD.status != 'assigned' AND NEW.driver_id IS NOT NULL THEN
    NEW.assigned_at = NOW();
  END IF;
  
  IF NEW.status = 'picked_up' AND OLD.status != 'picked_up' THEN
    NEW.picked_up_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_status_change
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION auto_complete_order_on_delivery();
