-- =====================================================
-- JordanMarket Database Schema - Phase 6
-- Cash Collection & Financial Settlements
-- =====================================================

-- =====================================================
-- CASH COLLECTION STATUS ENUM
-- =====================================================

CREATE TYPE cash_collection_status AS ENUM (
  'pending',
  'collected',
  'confirmed'
);

-- =====================================================
-- SETTLEMENT STATUS ENUM
-- =====================================================

CREATE TYPE settlement_status AS ENUM (
  'pending',
  'paid'
);

-- =====================================================
-- CASH COLLECTIONS TABLE
-- =====================================================

CREATE TABLE cash_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_expected NUMERIC(10,2) NOT NULL CHECK (amount_expected >= 0),
  amount_collected NUMERIC(10,2) CHECK (amount_collected >= 0),
  status cash_collection_status NOT NULL DEFAULT 'pending',
  
  collected_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cash_collections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SETTLEMENTS TABLE
-- =====================================================

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cash_collection_id UUID NOT NULL REFERENCES cash_collections(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Financial breakdown (all calculated server-side)
  order_amount NUMERIC(10,2) NOT NULL CHECK (order_amount >= 0),
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  driver_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (driver_fee >= 0),
  seller_amount NUMERIC(10,2) NOT NULL CHECK (seller_amount >= 0),
  
  status settlement_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR CASH COLLECTIONS
-- =====================================================

-- Drivers can read their own cash collections
CREATE POLICY "Drivers can read own cash collections"
  ON cash_collections FOR SELECT
  USING (driver_id = auth.uid());

-- Drivers can update their own pending collections to collected
CREATE POLICY "Drivers can mark cash as collected"
  ON cash_collections FOR UPDATE
  USING (
    driver_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    driver_id = auth.uid()
    AND status IN ('pending', 'collected')
  );

-- Sellers can read cash collections for their orders
CREATE POLICY "Sellers can read cash collections for their orders"
  ON cash_collections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = cash_collections.order_id 
      AND orders.seller_id = auth.uid()
    )
  );

-- Admin can read all cash collections
CREATE POLICY "Admin can read all cash collections"
  ON cash_collections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all cash collections
CREATE POLICY "Admin can update all cash collections"
  ON cash_collections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert cash collections
CREATE POLICY "Admin can insert cash collections"
  ON cash_collections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR SETTLEMENTS
-- =====================================================

-- Sellers can read their own settlements
CREATE POLICY "Sellers can read own settlements"
  ON settlements FOR SELECT
  USING (seller_id = auth.uid());

-- Drivers can read their own settlements
CREATE POLICY "Drivers can read own settlements"
  ON settlements FOR SELECT
  USING (driver_id = auth.uid());

-- Admin can read all settlements
CREATE POLICY "Admin can read all settlements"
  ON settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert settlements
CREATE POLICY "Admin can insert settlements"
  ON settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update settlements
CREATE POLICY "Admin can update settlements"
  ON settlements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER cash_collections_updated_at
  BEFORE UPDATE ON cash_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- FUNCTION: Auto-create cash collection on delivery
-- =====================================================

CREATE OR REPLACE FUNCTION auto_create_cash_collection()
RETURNS TRIGGER AS $$
DECLARE
  v_order_amount NUMERIC(10,2);
  v_driver_id UUID;
BEGIN
  -- When delivery status changes to delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Get order amount
    SELECT total_amount INTO v_order_amount
    FROM orders WHERE id = NEW.order_id;
    
    -- Get driver from delivery
    v_driver_id := NEW.driver_id;
    
    -- Create cash collection record
    INSERT INTO cash_collections (
      order_id,
      driver_id,
      amount_expected,
      status
    ) VALUES (
      NEW.order_id,
      v_driver_id,
      v_order_amount,
      'pending'
    )
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
CREATE TRIGGER auto_create_cash_collection_on_delivered
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION auto_create_cash_collection();

-- =====================================================
-- FUNCTION: Create settlement on cash confirmation
-- =====================================================

CREATE OR REPLACE FUNCTION create_settlement_on_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  v_order_id UUID;
  v_seller_id UUID;
  v_driver_id UUID;
  v_order_amount NUMERIC(10,2);
  v_platform_fee NUMERIC(10,2);
  v_driver_fee NUMERIC(10,2);
  v_seller_amount NUMERIC(10,2);
BEGIN
  -- When cash collection is confirmed
  IF NEW.status = 'confirmed' AND OLD.status = 'collected' THEN
    -- Get order details
    SELECT o.id, o.seller_id, o.total_amount
    INTO v_order_id, v_seller_id, v_order_amount
    FROM orders o
    WHERE o.id = NEW.order_id;
    
    v_driver_id := NEW.driver_id;
    
    -- Calculate fees (platform takes 10%, driver gets 5%)
    v_platform_fee := ROUND(v_order_amount * 0.10, 2);
    v_driver_fee := ROUND(v_order_amount * 0.05, 2);
    v_seller_amount := v_order_amount - v_platform_fee - v_driver_fee;
    
    -- Create settlement record
    INSERT INTO settlements (
      order_id,
      cash_collection_id,
      seller_id,
      driver_id,
      order_amount,
      platform_fee,
      driver_fee,
      seller_amount,
      status
    ) VALUES (
      v_order_id,
      NEW.id,
      v_seller_id,
      v_driver_id,
      v_order_amount,
      v_platform_fee,
      v_driver_fee,
      v_seller_amount,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
CREATE TRIGGER create_settlement_on_cash_confirmation
  AFTER UPDATE OF status ON cash_collections
  FOR EACH ROW EXECUTE FUNCTION create_settlement_on_confirmation();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_cash_collections_order_id ON cash_collections(order_id);
CREATE INDEX idx_cash_collections_driver_id ON cash_collections(driver_id);
CREATE INDEX idx_cash_collections_status ON cash_collections(status);
CREATE INDEX idx_cash_collections_created_at ON cash_collections(created_at DESC);

CREATE INDEX idx_settlements_order_id ON settlements(order_id);
CREATE INDEX idx_settlements_seller_id ON settlements(seller_id);
CREATE INDEX idx_settlements_driver_id ON settlements(driver_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_created_at ON settlements(created_at DESC);
