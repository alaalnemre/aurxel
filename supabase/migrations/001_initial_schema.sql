-- ============================================
-- Multi-Vendor Marketplace Database Schema
-- ============================================
-- Migration: 001_initial_schema
-- Description: Complete database schema for Jordan multi-vendor marketplace
-- Features: profiles, vendors, products, orders, deliveries, addresses
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles in the system
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'driver', 'admin');

-- Vendor business categories
CREATE TYPE vendor_category AS ENUM ('shop', 'food', 'pharmacy', 'grocery', 'parcel', 'rental');

-- Order lifecycle status
CREATE TYPE order_status AS ENUM (
    'pending',      -- Order placed, awaiting vendor confirmation
    'confirmed',    -- Vendor confirmed
    'preparing',    -- Vendor is preparing the order
    'ready',        -- Ready for pickup by driver
    'picked_up',    -- Driver picked up the order
    'in_transit',   -- Order is being delivered
    'delivered',    -- Successfully delivered
    'cancelled',    -- Order was cancelled
    'refunded'      -- Order was refunded
);

-- Delivery status
CREATE TYPE delivery_status AS ENUM (
    'pending',      -- Waiting for driver assignment
    'assigned',     -- Driver assigned
    'picked_up',    -- Driver picked up from vendor
    'in_transit',   -- On the way to customer
    'delivered',    -- Successfully delivered
    'failed'        -- Delivery failed
);

-- Payment methods
CREATE TYPE payment_method AS ENUM ('cod', 'online'); -- Currently only COD for Jordan

-- ============================================
-- TABLES
-- ============================================

-- Users Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendor Business Information
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_name_ar TEXT,
    category vendor_category NOT NULL,
    description TEXT,
    description_ar TEXT,
    logo_url TEXT,
    banner_url TEXT,
    
    -- Business details
    commercial_license TEXT,
    tax_number TEXT,
    
    -- Contact
    business_phone TEXT NOT NULL,
    business_email TEXT,
    business_address TEXT NOT NULL,
    business_address_ar TEXT,
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ,
    
    -- Ratings
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Product info
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    
    -- Category (flexible for multi-module support)
    category TEXT NOT NULL, -- e.g., 'electronics', 'food', 'medicine'
    subcategory TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= price),
    cost DECIMAL(10, 2), -- For vendor tracking
    
    -- Inventory
    sku TEXT,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT DEFAULT 5,
    
    -- Images
    image_url TEXT,
    additional_images TEXT[], -- Array of image URLs
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- SEO
    slug TEXT UNIQUE,
    
    -- Ratings
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on vendor_id for faster queries
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Customer Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Address details
    label TEXT, -- e.g., 'Home', 'Work'
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    area TEXT,
    building_number TEXT,
    floor TEXT,
    apartment TEXT,
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Delivery notes
    delivery_instructions TEXT,
    
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    
    -- Parties
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    
    -- Delivery
    delivery_address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    
    -- Order details
    status order_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL DEFAULT 'cod',
    
    -- Amounts (in JOD - Jordanian Dinar)
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Customer notes
    notes TEXT,
    
    -- Timestamps
    confirmed_at TIMESTAMPTZ,
    preparing_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items (line items for each product in an order)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Snapshot of product at time of order
    product_name TEXT NOT NULL,
    product_name_ar TEXT,
    product_image_url TEXT,
    
    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Deliveries
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number TEXT UNIQUE NOT NULL,
    
    -- Relations
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    
    -- Delivery details
    status delivery_status NOT NULL DEFAULT 'pending',
    
    -- Pickup location (vendor)
    pickup_address TEXT NOT NULL,
    pickup_phone TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    
    -- Delivery location (customer)
    delivery_address TEXT NOT NULL,
    delivery_phone TEXT NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    
    -- COD tracking
    cod_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cod_collected BOOLEAN NOT NULL DEFAULT FALSE,
    cod_collected_at TIMESTAMPTZ,
    
    -- Delivery notes
    driver_notes TEXT,
    customer_notes TEXT,
    
    -- Timestamps
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Vendors Policies
CREATE POLICY "Vendors are viewable by everyone"
    ON vendors FOR SELECT
    USING (true);

CREATE POLICY "Vendors can update own vendor profile"
    ON vendors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can do anything with vendors"
    ON vendors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Products Policies
CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true OR auth.uid() IN (
        SELECT user_id FROM vendors WHERE id = products.vendor_id
    ));

CREATE POLICY "Vendors can manage own products"
    ON products FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM vendors WHERE id = products.vendor_id
        )
    );

CREATE POLICY "Admins can manage all products"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Addresses Policies
CREATE POLICY "Users can view own addresses"
    ON addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses"
    ON addresses FOR ALL
    USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Customers can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Vendors can view their store orders"
    ON orders FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM vendors WHERE id = orders.vendor_id
        )
    );

CREATE POLICY "Customers can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can update their orders"
    ON orders FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM vendors WHERE id = orders.vendor_id
        )
    );

CREATE POLICY "Admins can manage all orders"
    ON orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Order Items Policies
CREATE POLICY "Order items viewable by order participants"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id = auth.uid()
                OR orders.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Customers can insert order items for their orders"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.customer_id = auth.uid()
        )
    );

-- Deliveries Policies
CREATE POLICY "Deliveries viewable by related parties"
    ON deliveries FOR SELECT
    USING (
        auth.uid() = driver_id
        OR auth.uid() IN (SELECT user_id FROM vendors WHERE id = deliveries.vendor_id)
        OR auth.uid() IN (SELECT customer_id FROM orders WHERE id = deliveries.order_id)
    );

CREATE POLICY "Drivers can update assigned deliveries"
    ON deliveries FOR UPDATE
    USING (auth.uid() = driver_id);

CREATE POLICY "Admins can manage all deliveries"
    ON deliveries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique delivery number
CREATE OR REPLACE FUNCTION generate_delivery_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DEL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Already created inline above, but documenting here for reference:
-- - idx_products_vendor_id
-- - idx_products_category
-- - idx_products_is_active
-- - idx_addresses_user_id
-- - idx_orders_customer_id
-- - idx_orders_vendor_id
-- - idx_orders_status
-- - idx_orders_created_at
-- - idx_order_items_order_id
-- - idx_order_items_product_id
-- - idx_deliveries_order_id
-- - idx_deliveries_driver_id
-- - idx_deliveries_status

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Example:
-- INSERT INTO profiles (id, full_name, role)
-- VALUES ('your-admin-user-id', 'Admin User', 'admin');

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE vendors IS 'Vendor business information and settings';
COMMENT ON TABLE products IS 'Multi-vendor product catalog';
COMMENT ON TABLE addresses IS 'Customer delivery addresses';
COMMENT ON TABLE orders IS 'Customer orders with vendor items';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON TABLE deliveries IS 'Delivery tracking and driver assignments';
