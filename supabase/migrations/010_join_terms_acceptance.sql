-- =====================================================
-- JordanMarket Database Schema - Phase 10b
-- Join Terms Acceptance Tracking
-- =====================================================

-- Add accepted_join_terms column to profiles table
-- (covers both sellers and drivers since they share profiles)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accepted_join_terms BOOLEAN DEFAULT FALSE;

-- Add accepted_join_terms_at timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accepted_join_terms_at TIMESTAMPTZ;

-- =====================================================
-- FUNCTION: Prevent approval if terms not accepted
-- =====================================================

CREATE OR REPLACE FUNCTION check_terms_before_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to seller and driver roles
  IF NEW.role IN ('seller', 'driver') THEN
    -- If being verified but terms not accepted, block it
    IF NEW.is_verified = TRUE AND OLD.is_verified = FALSE THEN
      IF NEW.accepted_join_terms IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot approve user who has not accepted join terms';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_terms_before_approval
  BEFORE UPDATE OF is_verified ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_terms_before_approval();

-- =====================================================
-- INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_accepted_join_terms 
ON profiles(accepted_join_terms) WHERE role IN ('seller', 'driver');
