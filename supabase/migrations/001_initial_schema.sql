-- JordanMarket Database Schema
-- Complete production-ready schema with RLS

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE order_status AS ENUM (
  'placed',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'completed',
  'cancelled'
);

CREATE TYPE delivery_status AS ENUM (
  'available',
  'assigned',
  'picked_up',
  'delivered'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE transaction_type AS ENUM (
  'credit',
  'debit',
  'refund',
  'adjustment'
);

CREATE TYPE dispute_status AS ENUM (
  'open',
  'investigating',
  'resolved',
  'closed'
);

CREATE TYPE notification_type AS ENUM (
  'order_update',
  'delivery_update',
  'wallet_update',
  'coins_update',
  'system',
  'promotion'
);

-- ============================================
-- PROFILES TABLE (Unified User System)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Capability flags
  is_buyer BOOLEAN NOT NULL DEFAULT true,
  is_seller BOOLEAN NOT NULL DEFAULT false,
  is_driver BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  
  -- Verification status
  seller_verified BOOLEAN NOT NULL DEFAULT false,
  driver_verified BOOLEAN NOT NULL DEFAULT false,
  seller_verification_status verification_status,
  driver_verification_status verification_status,
  seller_activated_at TIMESTAMPTZ,
  driver_activated_at TIMESTAMPTZ,
  
  default_address_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BUYERS TABLE
-- ============================================

CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_payment TEXT DEFAULT 'cod',
  coins_balance INTEGER NOT NULL DEFAULT 0 CHECK (coins_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SELLERS TABLE
-- ============================================

CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  rating_average NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  total_sales INTEGER NOT NULL DEFAULT 0 CHECK (total_sales >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DRIVERS TABLE
-- ============================================

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  rating_average NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  total_deliveries INTEGER NOT NULL DEFAULT 0 CHECK (total_deliveries >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  category TEXT NOT NULL,
  base_price NUMERIC(10,3) NOT NULL CHECK (base_price >= 0),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  rating_average NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  total_sold INTEGER NOT NULL DEFAULT 0 CHECK (total_sold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRODUCT VARIANTS TABLE
-- ============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  sku TEXT,
  price_adjustment NUMERIC(10,3) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ADDRESSES TABLE
-- ============================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  area TEXT,
  notes TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for default address after addresses table is created
ALTER TABLE profiles ADD CONSTRAINT fk_default_address 
  FOREIGN KEY (default_address_id) REFERENCES addresses(id) ON DELETE SET NULL;

-- ============================================
-- CARTS TABLE
-- ============================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CART ITEMS TABLE
-- ============================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,3) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id, variant_id)
);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'placed',
  subtotal NUMERIC(10,3) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount_amount NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  coins_used INTEGER NOT NULL DEFAULT 0 CHECK (coins_used >= 0),
  coins_discount NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (coins_discount >= 0),
  total NUMERIC(10,3) NOT NULL CHECK (total >= 0),
  delivery_address JSONB NOT NULL,
  notes TEXT,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,3) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,3) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DELIVERIES TABLE
-- ============================================

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status delivery_status NOT NULL DEFAULT 'available',
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  pickup_latitude NUMERIC(10,7),
  pickup_longitude NUMERIC(10,7),
  delivery_latitude NUMERIC(10,7),
  delivery_longitude NUMERIC(10,7),
  estimated_pickup_time TIMESTAMPTZ,
  estimated_delivery_time TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  delivery_proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DELIVERY REQUESTS TABLE
-- ============================================

CREATE TABLE delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(delivery_id, driver_id)
);

-- ============================================
-- WALLETS TABLE
-- ============================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'JOD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WALLET TRANSACTIONS TABLE (Immutable Ledger)
-- ============================================

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  type transaction_type NOT NULL,
  amount NUMERIC(12,3) NOT NULL,
  balance_before NUMERIC(12,3) NOT NULL,
  balance_after NUMERIC(12,3) NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make wallet_transactions immutable
CREATE RULE wallet_transactions_no_update AS ON UPDATE TO wallet_transactions DO INSTEAD NOTHING;
CREATE RULE wallet_transactions_no_delete AS ON DELETE TO wallet_transactions DO INSTEAD NOTHING;

-- ============================================
-- COINS LEDGER TABLE (Immutable Ledger)
-- ============================================

CREATE TABLE coins_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make coins_ledger immutable
CREATE RULE coins_ledger_no_update AS ON UPDATE TO coins_ledger DO INSTEAD NOTHING;
CREATE RULE coins_ledger_no_delete AS ON DELETE TO coins_ledger DO INSTEAD NOTHING;

-- ============================================
-- DISCOUNTS TABLE
-- ============================================

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,3) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10,3),
  max_discount_amount NUMERIC(10,3),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (valid_until > valid_from)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RATINGS TABLE
-- ============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_type TEXT NOT NULL CHECK (rated_type IN ('seller', 'driver', 'product')),
  rated_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, rater_id, rated_type, rated_id)
);

-- ============================================
-- TIPS TABLE
-- ============================================

CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,3) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DISPUTES TABLE
-- ============================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status dispute_status NOT NULL DEFAULT 'open',
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ADMIN LOGS TABLE (Immutable Audit Trail)
-- ============================================

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make admin_logs immutable
CREATE RULE admin_logs_no_update AS ON UPDATE TO admin_logs DO INSTEAD NOTHING;
CREATE RULE admin_logs_no_delete AS ON DELETE TO admin_logs DO INSTEAD NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_seller ON profiles(is_seller) WHERE is_seller = true;
CREATE INDEX idx_profiles_is_driver ON profiles(is_driver) WHERE is_driver = true;
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Products
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Orders
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at DESC);

-- Deliveries
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_available ON deliveries(status) WHERE status = 'available';

-- Wallets
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- Coins
CREATE INDEX idx_coins_ledger_profile ON coins_ledger(profile_id);
CREATE INDEX idx_coins_ledger_created ON coins_ledger(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_unread ON notifications(profile_id, is_read) WHERE is_read = false;

-- Ratings
CREATE INDEX idx_ratings_rated ON ratings(rated_type, rated_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view basic seller/driver profiles"
  ON profiles FOR SELECT
  USING (is_seller = true OR is_driver = true);

-- ============================================
-- RLS POLICIES - BUYERS
-- ============================================

CREATE POLICY "Users can view their own buyer record"
  ON buyers FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own buyer record"
  ON buyers FOR UPDATE
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - SELLERS
-- ============================================

CREATE POLICY "Public can view verified sellers"
  ON sellers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = sellers.profile_id 
      AND p.seller_verified = true
    )
  );

CREATE POLICY "Sellers can manage their own seller record"
  ON sellers FOR ALL
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - DRIVERS
-- ============================================

CREATE POLICY "Drivers can view their own driver record"
  ON drivers FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Drivers can update their own driver record"
  ON drivers FOR UPDATE
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - PRODUCTS
-- ============================================

CREATE POLICY "Public can view active products from verified sellers"
  ON products FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM sellers s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = products.seller_id
      AND p.seller_verified = true
    )
  );

CREATE POLICY "Sellers can manage their own products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers s
      WHERE s.id = products.seller_id
      AND s.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - PRODUCT VARIANTS
-- ============================================

CREATE POLICY "Public can view active variants"
  ON product_variants FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_variants.product_id
      AND p.is_active = true
    )
  );

CREATE POLICY "Sellers can manage their product variants"
  ON product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN sellers s ON s.id = p.seller_id
      WHERE p.id = product_variants.product_id
      AND s.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - ADDRESSES
-- ============================================

CREATE POLICY "Users can manage their own addresses"
  ON addresses FOR ALL
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - CARTS
-- ============================================

CREATE POLICY "Users can manage their own cart"
  ON carts FOR ALL
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - CART ITEMS
-- ============================================

CREATE POLICY "Users can manage their own cart items"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_items.cart_id
      AND c.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - ORDERS
-- ============================================

CREATE POLICY "Buyers can view their own orders"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view orders for their products"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sellers s
      WHERE s.id = orders.seller_id
      AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sellers s
      WHERE s.id = orders.seller_id
      AND s.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - ORDER ITEMS
-- ============================================

CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.buyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM sellers s
          WHERE s.id = o.seller_id
          AND s.profile_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- RLS POLICIES - DELIVERIES
-- ============================================

CREATE POLICY "Available deliveries visible to verified drivers"
  ON deliveries FOR SELECT
  USING (
    status = 'available' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.driver_verified = true
    )
  );

CREATE POLICY "Drivers can view their assigned deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = deliveries.driver_id
      AND d.profile_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view their order deliveries"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = deliveries.order_id
      AND o.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their deliveries"
  ON deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = deliveries.driver_id
      AND d.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - DELIVERY REQUESTS
-- ============================================

CREATE POLICY "Drivers can view their delivery requests"
  ON delivery_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = delivery_requests.driver_id
      AND d.profile_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create delivery requests"
  ON delivery_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = delivery_requests.driver_id
      AND d.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - WALLETS
-- ============================================

CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - WALLET TRANSACTIONS
-- ============================================

CREATE POLICY "Users can view their own wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wallets w
      WHERE w.id = wallet_transactions.wallet_id
      AND w.profile_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - COINS LEDGER
-- ============================================

CREATE POLICY "Users can view their own coins ledger"
  ON coins_ledger FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - DISCOUNTS
-- ============================================

CREATE POLICY "Active discounts are publicly viewable"
  ON discounts FOR SELECT
  USING (is_active = true AND NOW() BETWEEN valid_from AND valid_until);

-- ============================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (profile_id = auth.uid());

-- ============================================
-- RLS POLICIES - RATINGS
-- ============================================

CREATE POLICY "Public can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for their orders"
  ON ratings FOR INSERT
  WITH CHECK (
    rater_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = ratings.order_id
      AND o.buyer_id = auth.uid()
      AND o.status = 'completed'
    )
  );

-- ============================================
-- RLS POLICIES - TIPS
-- ============================================

CREATE POLICY "Drivers can view their tips"
  ON tips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = tips.driver_id
      AND d.profile_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view and create tips"
  ON tips FOR ALL
  USING (buyer_id = auth.uid());

-- ============================================
-- RLS POLICIES - DISPUTES
-- ============================================

CREATE POLICY "Users can view disputes they raised"
  ON disputes FOR SELECT
  USING (raised_by = auth.uid());

CREATE POLICY "Sellers can view disputes on their orders"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN sellers s ON s.id = o.seller_id
      WHERE o.id = disputes.order_id
      AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (raised_by = auth.uid());

-- ============================================
-- RLS POLICIES - ADMIN LOGS
-- ============================================

CREATE POLICY "Admins can view admin logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Handle new user registration
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Create buyer record (default capability)
  INSERT INTO buyers (profile_id)
  VALUES (NEW.id);
  
  -- Create wallet
  INSERT INTO wallets (profile_id)
  VALUES (NEW.id);
  
  -- Create cart
  INSERT INTO carts (profile_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTION: Generate order number
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
BEGIN
  date_part := to_char(NOW(), 'YYMMDD');
  random_part := upper(substr(md5(random()::text), 1, 6));
  NEW.order_number := 'JM-' || date_part || '-' || random_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- ============================================
-- FUNCTION: Validate order status transition
-- ============================================

CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Define valid transitions
  -- placed -> accepted, cancelled
  -- accepted -> preparing, cancelled
  -- preparing -> ready_for_pickup, cancelled
  -- ready_for_pickup -> completed, cancelled
  -- completed, cancelled -> (terminal, no transitions)
  
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  IF OLD.status = 'placed' AND NEW.status NOT IN ('accepted', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'accepted' AND NEW.status NOT IN ('preparing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'preparing' AND NEW.status NOT IN ('ready_for_pickup', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'ready_for_pickup' AND NEW.status NOT IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.status;
  END IF;
  
  -- Set timestamps based on new status
  IF NEW.status = 'accepted' THEN
    NEW.accepted_at := NOW();
  ELSIF NEW.status = 'preparing' THEN
    NEW.preparing_at := NOW();
  ELSIF NEW.status = 'ready_for_pickup' THEN
    NEW.ready_at := NOW();
  ELSIF NEW.status = 'completed' THEN
    NEW.completed_at := NOW();
  ELSIF NEW.status = 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_order_status_transition
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_order_status_transition();

-- ============================================
-- FUNCTION: Validate delivery status transition
-- ============================================

CREATE OR REPLACE FUNCTION validate_delivery_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Define valid transitions
  -- available -> assigned
  -- assigned -> picked_up
  -- picked_up -> delivered
  
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  IF OLD.status = 'available' AND NEW.status != 'assigned' THEN
    RAISE EXCEPTION 'Invalid delivery status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'assigned' AND NEW.status != 'picked_up' THEN
    RAISE EXCEPTION 'Invalid delivery status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'picked_up' AND NEW.status != 'delivered' THEN
    RAISE EXCEPTION 'Invalid delivery status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  IF OLD.status = 'delivered' THEN
    RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.status;
  END IF;
  
  -- Set timestamps based on new status
  IF NEW.status = 'picked_up' THEN
    NEW.actual_pickup_time := NOW();
  ELSIF NEW.status = 'delivered' THEN
    NEW.actual_delivery_time := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_delivery_status_transition
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_delivery_status_transition();

-- ============================================
-- FUNCTION: Update seller stats on order completion
-- ============================================

CREATE OR REPLACE FUNCTION update_seller_stats_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE sellers
    SET total_sales = total_sales + 1
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_seller_stats_on_order_complete();

-- ============================================
-- FUNCTION: Update driver stats on delivery completion
-- ============================================

CREATE OR REPLACE FUNCTION update_driver_stats_on_delivery_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE drivers
    SET total_deliveries = total_deliveries + 1
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_completed
  AFTER UPDATE ON deliveries
  FOR EACH ROW
  WHEN (NEW.status = 'delivered' AND OLD.status != 'delivered')
  EXECUTE FUNCTION update_driver_stats_on_delivery_complete();

-- ============================================
-- FUNCTION: Update product sold count
-- ============================================

CREATE OR REPLACE FUNCTION update_product_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET total_sold = total_sold + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_created
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_sold_count();

-- ============================================
-- FUNCTION: Calculate and update rating averages
-- ============================================

CREATE OR REPLACE FUNCTION update_rating_average()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rated_type = 'seller' THEN
    UPDATE sellers
    SET 
      rating_average = (
        SELECT COALESCE(AVG(rating), 0)
        FROM ratings
        WHERE rated_type = 'seller' AND rated_id = NEW.rated_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM ratings
        WHERE rated_type = 'seller' AND rated_id = NEW.rated_id
      )
    WHERE id = NEW.rated_id;
    
  ELSIF NEW.rated_type = 'driver' THEN
    UPDATE drivers
    SET 
      rating_average = (
        SELECT COALESCE(AVG(rating), 0)
        FROM ratings
        WHERE rated_type = 'driver' AND rated_id = NEW.rated_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM ratings
        WHERE rated_type = 'driver' AND rated_id = NEW.rated_id
      )
    WHERE id = NEW.rated_id;
    
  ELSIF NEW.rated_type = 'product' THEN
    UPDATE products
    SET 
      rating_average = (
        SELECT COALESCE(AVG(rating), 0)
        FROM ratings
        WHERE rated_type = 'product' AND rated_id = NEW.rated_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM ratings
        WHERE rated_type = 'product' AND rated_id = NEW.rated_id
      )
    WHERE id = NEW.rated_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_average();
