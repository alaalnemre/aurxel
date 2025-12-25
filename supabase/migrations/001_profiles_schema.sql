-- =====================================================
-- JordanMarket Database Schema - Phase 2
-- User Profiles, Roles & Approval System
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'driver', 'admin');

-- Approval status for sellers/drivers
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- SELLER PROFILES TABLE
-- =====================================================

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_phone TEXT,
  business_description TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status approval_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_profiles
-- Sellers can view their own profile
CREATE POLICY "Sellers can view own seller profile"
  ON seller_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Sellers can insert their own profile
CREATE POLICY "Sellers can create own seller profile"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sellers can update their own profile (but not status)
CREATE POLICY "Sellers can update own seller profile"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all seller profiles
CREATE POLICY "Admin can view all seller profiles"
  ON seller_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all seller profiles (for approval)
CREATE POLICY "Admin can update all seller profiles"
  ON seller_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DRIVER PROFILES TABLE
-- =====================================================

CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  license_number TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status approval_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_profiles
-- Drivers can view their own profile
CREATE POLICY "Drivers can view own driver profile"
  ON driver_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Drivers can insert their own profile
CREATE POLICY "Drivers can create own driver profile"
  ON driver_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Drivers can update their own profile (but not status)
CREATE POLICY "Drivers can update own driver profile"
  ON driver_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all driver profiles
CREATE POLICY "Admin can view all driver profiles"
  ON driver_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all driver profiles (for approval)
CREATE POLICY "Admin can update all driver profiles"
  ON driver_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'buyer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Apply to seller_profiles
CREATE TRIGGER seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Apply to driver_profiles
CREATE TRIGGER driver_profiles_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_status ON driver_profiles(status);
