-- =====================================================
-- 003_sellers_drivers.sql
-- Create sellers and drivers tables
-- =====================================================

-- Sellers table
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  description TEXT,
  store_address TEXT,
  store_city TEXT,
  store_phone TEXT,
  logo_url TEXT,
  status seller_status DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  license_url TEXT,
  status driver_status DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  available_for_delivery BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
