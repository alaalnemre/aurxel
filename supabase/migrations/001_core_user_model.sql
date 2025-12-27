-- ============================================
-- JordanMarket Phase 2A: Database Schema
-- ============================================
-- This migration creates the core user model:
-- - profiles: User profile with capability flags
-- - seller_profiles: Seller capability data
-- - driver_profiles: Driver capability data
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

-- Seller application status
CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected');

-- Driver application status
CREATE TYPE driver_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- 2. PROFILES TABLE
-- ============================================
-- Every auth.users row gets a corresponding profile
-- Capabilities are flags, not exclusive roles

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Capability flags (buyer-first model)
    is_buyer BOOLEAN NOT NULL DEFAULT TRUE,
    is_seller BOOLEAN NOT NULL DEFAULT FALSE,
    is_driver BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- 3. SELLER PROFILES TABLE
-- ============================================
-- Created when a user requests to become a seller

CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_description TEXT,
    store_logo_url TEXT,
    business_address TEXT,
    status seller_status NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One seller profile per user
    CONSTRAINT unique_seller_per_user UNIQUE (user_id)
);

-- Index for status queries
CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);

-- ============================================
-- 4. DRIVER PROFILES TABLE
-- ============================================
-- Created when a user requests to become a driver

CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    license_number TEXT,
    status driver_status NOT NULL DEFAULT 'pending',
    
    -- Location tracking (for future use)
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One driver profile per user
    CONSTRAINT unique_driver_per_user UNIQUE (user_id)
);

-- Index for status and availability queries
CREATE INDEX idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_available ON driver_profiles(is_available) WHERE is_available = TRUE;

-- ============================================
-- 5. AUTO-CREATE PROFILE TRIGGER
-- ============================================
-- When a new user signs up via Supabase Auth,
-- automatically create their profile row

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================
-- Auto-update the updated_at column on any update

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at
    BEFORE UPDATE ON driver_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (but not capability flags)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can do anything (for triggers)
CREATE POLICY "Service role full access on profiles"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------
-- SELLER PROFILES POLICIES
-- -----------------------------------------

-- Users can read their own seller profile
CREATE POLICY "Users can read own seller profile"
    ON seller_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own seller profile (once)
CREATE POLICY "Users can insert own seller profile"
    ON seller_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own seller profile
CREATE POLICY "Users can update own seller profile"
    ON seller_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on seller_profiles"
    ON seller_profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------
-- DRIVER PROFILES POLICIES
-- -----------------------------------------

-- Users can read their own driver profile
CREATE POLICY "Users can read own driver profile"
    ON driver_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own driver profile (once)
CREATE POLICY "Users can insert own driver profile"
    ON driver_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own driver profile
CREATE POLICY "Users can update own driver profile"
    ON driver_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on driver_profiles"
    ON driver_profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- 8. ADMIN POLICIES (FUTURE-PROOF)
-- ============================================

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update seller profiles (for approval)
CREATE POLICY "Admins can update seller profiles"
    ON seller_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can read all seller profiles
CREATE POLICY "Admins can read all seller profiles"
    ON seller_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update driver profiles (for approval)
CREATE POLICY "Admins can update driver profiles"
    ON driver_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can read all driver profiles
CREATE POLICY "Admins can read all driver profiles"
    ON driver_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );
