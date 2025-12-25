-- =====================================================
-- JordanMarket Database Schema - Phase 8
-- Notifications & Analytics
-- =====================================================

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'order_status', 'delivery_status', 'cash_confirmed', 'qanz_topup', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Optional reference to related entity
  reference_type TEXT, -- 'order', 'delivery', 'settlement', 'qanz'
  reference_id UUID,
  
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- =====================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin can read all notifications
CREATE POLICY "Admin can read all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System/Admin can insert notifications
-- Using SECURITY DEFINER functions for inserts
CREATE POLICY "Admin can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FUNCTION: Create notification (SECURITY DEFINER)
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    reference_type,
    reference_id
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_reference_type,
    p_reference_id
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get unread notification count
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = v_user_id AND is_read = FALSE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Notify on order status change
-- =====================================================

CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_buyer_id UUID;
  v_seller_id UUID;
  v_order_number TEXT;
BEGIN
  -- Only trigger if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_order_number := substring(NEW.id::text, 1, 8);
    v_buyer_id := NEW.buyer_id;
    v_seller_id := NEW.seller_id;
    
    -- Notify buyer
    PERFORM create_notification(
      v_buyer_id,
      'order_status',
      'Order Status Updated',
      'Your order #' || UPPER(v_order_number) || ' is now ' || NEW.status,
      'order',
      NEW.id
    );
    
    -- Notify seller (except for pending)
    IF NEW.status != 'pending' THEN
      PERFORM create_notification(
        v_seller_id,
        'order_status',
        'Order Status Updated',
        'Order #' || UPPER(v_order_number) || ' is now ' || NEW.status,
        'order',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_order_status
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();

-- =====================================================
-- TRIGGER: Notify on delivery status change
-- =====================================================

CREATE OR REPLACE FUNCTION notify_delivery_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_buyer_id UUID;
  v_driver_id UUID;
  v_order_number TEXT;
BEGIN
  -- Get order details
  SELECT buyer_id INTO v_buyer_id
  FROM orders WHERE id = NEW.order_id;
  
  v_order_number := substring(NEW.order_id::text, 1, 8);
  v_driver_id := NEW.driver_id;
  
  -- Notify on assignment
  IF OLD.status = 'available' AND NEW.status = 'assigned' AND v_driver_id IS NOT NULL THEN
    PERFORM create_notification(
      v_driver_id,
      'delivery_assigned',
      'New Delivery Assigned',
      'You have been assigned delivery for order #' || UPPER(v_order_number),
      'delivery',
      NEW.id
    );
    
    PERFORM create_notification(
      v_buyer_id,
      'delivery_assigned',
      'Driver Assigned',
      'A driver has been assigned to your order #' || UPPER(v_order_number),
      'order',
      NEW.order_id
    );
  END IF;
  
  -- Notify on pickup
  IF OLD.status = 'assigned' AND NEW.status = 'picked_up' THEN
    PERFORM create_notification(
      v_buyer_id,
      'delivery_picked_up',
      'Order Picked Up',
      'Your order #' || UPPER(v_order_number) || ' is on the way!',
      'order',
      NEW.order_id
    );
  END IF;
  
  -- Notify on delivery
  IF OLD.status = 'picked_up' AND NEW.status = 'delivered' THEN
    PERFORM create_notification(
      v_buyer_id,
      'delivery_completed',
      'Order Delivered',
      'Your order #' || UPPER(v_order_number) || ' has been delivered!',
      'order',
      NEW.order_id
    );
    
    IF v_driver_id IS NOT NULL THEN
      PERFORM create_notification(
        v_driver_id,
        'delivery_completed',
        'Delivery Complete',
        'You have completed delivery for order #' || UPPER(v_order_number),
        'delivery',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_delivery_status
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_status_change();

-- =====================================================
-- TRIGGER: Notify on cash confirmation
-- =====================================================

CREATE OR REPLACE FUNCTION notify_cash_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_driver_id UUID;
  v_order_number TEXT;
BEGIN
  -- Only trigger when status changes to confirmed
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    -- Get seller from order
    SELECT o.seller_id INTO v_seller_id
    FROM orders o WHERE o.id = NEW.order_id;
    
    v_driver_id := NEW.driver_id;
    v_order_number := substring(NEW.order_id::text, 1, 8);
    
    -- Notify seller
    PERFORM create_notification(
      v_seller_id,
      'cash_confirmed',
      'Cash Confirmed',
      'Cash for order #' || UPPER(v_order_number) || ' has been confirmed. Settlement pending.',
      'order',
      NEW.order_id
    );
    
    -- Notify driver
    PERFORM create_notification(
      v_driver_id,
      'cash_confirmed',
      'Cash Confirmed',
      'Cash for order #' || UPPER(v_order_number) || ' has been confirmed.',
      'order',
      NEW.order_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_cash_confirmation
  AFTER UPDATE OF status ON cash_collections
  FOR EACH ROW EXECUTE FUNCTION notify_cash_confirmed();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
