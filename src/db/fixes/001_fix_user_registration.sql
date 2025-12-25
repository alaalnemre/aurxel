-- ============================================
-- PRODUCTION FIX: User Registration Profile Creation
-- ============================================
-- 
-- Problem: "Database error saving new user" occurs because:
--   1. RLS is enabled on profiles table
--   2. No INSERT policy exists for profiles
--   3. Trigger function may lack proper permissions
--
-- This fix:
--   1. Recreates the trigger function with correct SECURITY DEFINER
--   2. Ensures function is owned by postgres (bypasses RLS)
--   3. Adds SET search_path for security
--   4. Drops and recreates trigger to ensure clean state
--
-- Safe to run multiple times (idempotent)
-- ============================================

-- Step 1: Drop existing trigger (if any)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create or replace the function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, locale)
  VALUES (
    NEW.id,
    'buyer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Ensure function is owned by postgres (required for SECURITY DEFINER to bypass RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant execute permission (belt and suspenders)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- ============================================
-- VERIFICATION: Run this SELECT to confirm trigger exists
-- ============================================
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
