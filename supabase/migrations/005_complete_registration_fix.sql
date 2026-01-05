-- ============================================
-- COMPLETE FIX FOR REGISTRATION SYSTEM
-- ============================================
-- This migration fixes all registration issues:
-- 1. Updates handle_new_user trigger to include phone
-- 2. Adds missing INSERT policy for profiles
-- 3. Ensures trigger has proper SECURITY DEFINER
-- ============================================

-- Step 1: Update the trigger function to include phone field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Recreate the trigger (in case it was deleted)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Add INSERT policy for profiles (for manual profile creation if needed)
-- This is a backup in case the trigger fails
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Trigger function: handle_new_user - UPDATED';
    RAISE NOTICE 'Trigger: on_auth_user_created - RECREATED';
    RAISE NOTICE 'INSERT policy for profiles - CREATED';
END $$;
