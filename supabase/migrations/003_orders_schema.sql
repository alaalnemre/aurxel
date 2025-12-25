-- =====================================================
-- JordanMarket Database Schema - Phase 4
-- Cart, Checkout & Orders (COD Only)
-- =====================================================

-- =====================================================
-- ORDER STATUS ENUM
-- =====================================================

CREATE TYPE order_status AS ENUM (
  'placed',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'picked_up',
  'delivered',
  'cancelled'
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'placed',
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cod',
  
  -- Delivery info (for future use)
  delivery_address TEXT,
  delivery_phone TEXT,
  delivery_notes TEXT,
  
  -- Timestamps
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Buyers can read their own orders
CREATE POLICY "Buyers can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'buyer'
    )
  );

-- Sellers can read orders for their products
CREATE POLICY "Sellers can read their orders"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can update order status (limited)
CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Admin can read all orders
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all orders
CREATE POLICY "Admin can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Snapshot at time of order
  product_name_ar TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
-- Users can read items for orders they can see
CREATE POLICY "Users can read order items for their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Only through order creation (handled by function)
CREATE POLICY "Order items created with order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.buyer_id = auth.uid()
    )
  );

-- Admin can read all order items
CREATE POLICY "Admin can read all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGER FOR ORDERS
-- =====================================================

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- FUNCTION: Validate order status transitions
-- =====================================================

CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow same status (no change)
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions
  IF OLD.status = 'placed' AND NEW.status IN ('accepted', 'cancelled') THEN
    IF NEW.status = 'accepted' THEN
      NEW.accepted_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'accepted' AND NEW.status IN ('preparing', 'cancelled') THEN
    IF NEW.status = 'preparing' THEN
      NEW.preparing_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'preparing' AND NEW.status IN ('ready_for_pickup', 'cancelled') THEN
    IF NEW.status = 'ready_for_pickup' THEN
      NEW.ready_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'ready_for_pickup' AND NEW.status IN ('assigned', 'cancelled') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'assigned' AND NEW.status IN ('picked_up', 'cancelled') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'picked_up' AND NEW.status IN ('delivered', 'cancelled') THEN
    IF NEW.status = 'delivered' THEN
      NEW.delivered_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  -- Invalid transition
  RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
CREATE TRIGGER validate_order_status
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION validate_order_status_transition();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
