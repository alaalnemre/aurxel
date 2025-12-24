-- ============================================
-- Migration 001: Core Schema
-- Creates enums and base tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (Single source of truth for status values)
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'driver', 'admin');

-- KYC status for sellers and drivers
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Order status - LOCKED FLOW: pending_seller -> preparing -> ready_for_pickup -> completed
CREATE TYPE order_status AS ENUM ('pending_seller', 'preparing', 'ready_for_pickup', 'completed');

-- Delivery status - LOCKED FLOW: available -> assigned -> picked_up -> delivered
CREATE TYPE delivery_status AS ENUM ('available', 'assigned', 'picked_up', 'delivered');

-- Support ticket status
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Support ticket priority
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Wallet transaction types
CREATE TYPE wallet_transaction_type AS ENUM (
  'topup',        -- Admin-issued code redemption
  'purchase',     -- Buyer payment
  'sale_credit',  -- Seller receives from sale
  'delivery_fee', -- Driver receives delivery fee
  'refund',       -- Refund to buyer
  'withdrawal'    -- Cash out (future)
);

-- Top-up code status
CREATE TYPE topup_code_status AS ENUM ('active', 'redeemed', 'revoked');

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT,
  phone TEXT,
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'ar')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, locale)
  VALUES (
    NEW.id,
    'buyer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SELLERS TABLE
-- KYC and business info for seller role
-- ============================================

CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  address TEXT,
  id_document_url TEXT,
  status kyc_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sellers_user_id ON sellers(user_id);
CREATE INDEX idx_sellers_status ON sellers(status);

-- ============================================
-- DRIVERS TABLE
-- KYC info for driver role
-- ============================================

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  id_document_url TEXT,
  status kyc_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ============================================
-- CATEGORIES TABLE
-- Product categories with i18n names
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
