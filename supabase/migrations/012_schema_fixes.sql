-- =====================================================
-- JordanMarket Schema Fixes
-- Fix missing columns and broken triggers
-- Run this AFTER all other migrations (009, 010, 011)
-- =====================================================

-- 1) Add is_verified column to profiles (used by audit triggers)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2) Add email column to profiles (used by audit triggers)
-- Note: email comes from auth.users, but we store a copy for convenience
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3) Create trigger to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := (SELECT email FROM auth.users WHERE id = NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply sync on profile insert/update
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON profiles;
CREATE TRIGGER sync_profile_email_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_email();

-- 4) Backfill email for existing profiles
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 5) Index for is_verified
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- 6) Set is_verified = true for approved sellers/drivers
UPDATE profiles p
SET is_verified = TRUE
WHERE p.role = 'seller' AND EXISTS (
  SELECT 1 FROM seller_profiles sp 
  WHERE sp.user_id = p.id AND sp.status = 'approved'
);

UPDATE profiles p
SET is_verified = TRUE
WHERE p.role = 'driver' AND EXISTS (
  SELECT 1 FROM driver_profiles dp 
  WHERE dp.user_id = p.id AND dp.status = 'approved'
);
