-- =====================================================
-- JordanMarket Database Schema - Phase 10
-- Audit Logs & Production Hardening
-- =====================================================

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR AUDIT LOGS
-- =====================================================

-- Only admin can read audit logs
CREATE POLICY "Admin can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert via SECURITY DEFINER functions
-- No direct insert policy for users

-- =====================================================
-- FUNCTION: Create Audit Log (SECURITY DEFINER)
-- =====================================================

CREATE OR REPLACE FUNCTION create_audit_log(
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_actor_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Audit admin approval of sellers
-- =====================================================

CREATE OR REPLACE FUNCTION audit_seller_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_verified = FALSE AND NEW.is_verified = TRUE AND NEW.role = 'seller' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'seller_approved',
      'profile',
      NEW.id,
      jsonb_build_object('email', NEW.email, 'full_name', NEW.full_name)
    );
  END IF;
  
  IF OLD.is_verified = TRUE AND NEW.is_verified = FALSE AND NEW.role = 'seller' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'seller_rejected',
      'profile',
      NEW.id,
      jsonb_build_object('email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_seller_approval_trigger
  AFTER UPDATE OF is_verified ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_seller_approval();

-- =====================================================
-- TRIGGER: Audit cash confirmation
-- =====================================================

CREATE OR REPLACE FUNCTION audit_cash_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    PERFORM create_audit_log(
      NEW.confirmed_by,
      'cash_confirmed',
      'cash_collection',
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.order_id,
        'amount', NEW.amount_collected,
        'driver_id', NEW.driver_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_cash_confirmation_trigger
  AFTER UPDATE OF status ON cash_collections
  FOR EACH ROW EXECUTE FUNCTION audit_cash_confirmation();

-- =====================================================
-- TRIGGER: Audit QANZ code generation
-- =====================================================

CREATE OR REPLACE FUNCTION audit_qanz_code_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    NEW.created_by,
    'qanz_code_created',
    'qanz_topup_code',
    NEW.id,
    jsonb_build_object('amount', NEW.amount, 'code', NEW.code)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_qanz_code_creation_trigger
  AFTER INSERT ON qanz_topup_codes
  FOR EACH ROW EXECUTE FUNCTION audit_qanz_code_creation();

-- =====================================================
-- TRIGGER: Audit reward issuance
-- =====================================================

CREATE OR REPLACE FUNCTION audit_reward_issuance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    NULL, -- System action
    'reward_issued',
    'qanz_reward_event',
    NEW.id,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'key', NEW.key,
      'amount', NEW.issued_amount,
      'reference_type', NEW.reference_type,
      'reference_id', NEW.reference_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_reward_issuance_trigger
  AFTER INSERT ON qanz_reward_events
  FOR EACH ROW EXECUTE FUNCTION audit_reward_issuance();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);

-- =====================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- =====================================================

-- Orders performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Products performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Deliveries performance
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
