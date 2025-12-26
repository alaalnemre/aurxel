-- =====================================================
-- JordanMarket Database Schema - Phase 10c
-- Profile Completion Tracking
-- =====================================================

-- Add profile_completed column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Set existing buyers to profile_completed = true (buyers don't need onboarding)
UPDATE profiles SET profile_completed = TRUE WHERE role = 'buyer';

-- Set existing sellers/drivers who have submitted onboarding to profile_completed = true
-- (If they have a seller_profile or driver_profile entry, they've completed onboarding)
UPDATE profiles SET profile_completed = TRUE
WHERE role = 'seller' AND id IN (SELECT user_id FROM seller_profiles WHERE status IS NOT NULL);

UPDATE profiles SET profile_completed = TRUE
WHERE role = 'driver' AND id IN (SELECT user_id FROM driver_profiles WHERE status IS NOT NULL);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
