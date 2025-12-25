-- =====================================================
-- JordanMarket Database Schema - Phase 5
-- Delivery & Driver System
-- =====================================================

-- =====================================================
-- DELIVERY STATUS ENUM
-- =====================================================

CREATE TYPE delivery_status AS ENUM (
  'available',
  'assigned',
  'picked_up',
  'delivered'
);

-- =====================================================
-- DELIVERIES TABLE
-- =====================================================

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status delivery_status NOT NULL DEFAULT 'available',
  
  -- Timestamps for tracking
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR DELIVERIES
-- =====================================================

-- Drivers can read available deliveries or their own
CREATE POLICY "Drivers can read available or own deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver'
    )
    AND (status = 'available' OR driver_id = auth.uid())
  );

-- Drivers can accept available deliveries (update to assign themselves)
CREATE POLICY "Drivers can accept available deliveries"
  ON deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
    AND (
      status = 'available' OR driver_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- Sellers can read deliveries for their orders
CREATE POLICY "Sellers can read deliveries for their orders"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.seller_id = auth.uid()
    )
  );

-- Buyers can read deliveries for their orders
CREATE POLICY "Buyers can read deliveries for their orders"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.buyer_id = auth.uid()
    )
  );

-- Admin can read all deliveries
CREATE POLICY "Admin can read all deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all deliveries
CREATE POLICY "Admin can update all deliveries"
  ON deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert deliveries
CREATE POLICY "Admin can insert deliveries"
  ON deliveries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System/trigger can insert deliveries (for auto-creation)
-- Note: This is handled by the trigger which runs with elevated privileges

-- =====================================================
-- UPDATED_AT TRIGGER FOR DELIVERIES
-- =====================================================

CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- FUNCTION: Validate delivery status transitions
-- =====================================================

CREATE OR REPLACE FUNCTION validate_delivery_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow same status (no change)
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- available -> assigned (driver accepts)
  IF OLD.status = 'available' AND NEW.status = 'assigned' THEN
    IF NEW.driver_id IS NULL THEN
      RAISE EXCEPTION 'Driver must be assigned when status changes to assigned';
    END IF;
    NEW.assigned_at = NOW();
    RETURN NEW;
  END IF;

  -- assigned -> picked_up
  IF OLD.status = 'assigned' AND NEW.status = 'picked_up' THEN
    NEW.picked_up_at = NOW();
    RETURN NEW;
  END IF;

  -- picked_up -> delivered
  IF OLD.status = 'picked_up' AND NEW.status = 'delivered' THEN
    NEW.delivered_at = NOW();
    RETURN NEW;
  END IF;

  -- Invalid transition
  RAISE EXCEPTION 'Invalid delivery status transition from % to %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
CREATE TRIGGER validate_delivery_status
  BEFORE UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION validate_delivery_status_transition();

-- =====================================================
-- FUNCTION: Auto-create delivery when order is ready
-- =====================================================

CREATE OR REPLACE FUNCTION auto_create_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to ready_for_pickup, create a delivery
  IF NEW.status = 'ready_for_pickup' AND OLD.status != 'ready_for_pickup' THEN
    INSERT INTO deliveries (order_id, status)
    VALUES (NEW.id, 'available')
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply auto-create trigger
CREATE TRIGGER auto_create_delivery_on_ready
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION auto_create_delivery();

-- =====================================================
-- FUNCTION: Sync order status with delivery
-- =====================================================

CREATE OR REPLACE FUNCTION sync_order_status_with_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- When delivery is assigned, update order to 'assigned'
  IF NEW.status = 'assigned' AND OLD.status = 'available' THEN
    UPDATE orders SET status = 'assigned' WHERE id = NEW.order_id;
  END IF;

  -- When delivery is picked_up, update order to 'picked_up'
  IF NEW.status = 'picked_up' AND OLD.status = 'assigned' THEN
    UPDATE orders SET status = 'picked_up' WHERE id = NEW.order_id;
  END IF;

  -- When delivery is delivered, update order to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status = 'picked_up' THEN
    UPDATE orders SET status = 'delivered' WHERE id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply sync trigger
CREATE TRIGGER sync_order_delivery_status
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION sync_order_status_with_delivery();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
