-- =====================================================
-- 024_rls_badges.sql
-- Row Level Security policies for badges system
-- =====================================================

-- =====================================================
-- BADGES RLS (badge definitions)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active badges" ON badges;
DROP POLICY IF EXISTS "Admin full access to badges" ON badges;

-- Public: Can view active badges (read-only)
CREATE POLICY "Public can view active badges"
  ON badges
  FOR SELECT
  TO authenticated, anon
  USING (is_active = TRUE);

-- Admin: Full access to badges
CREATE POLICY "Admin full access to badges"
  ON badges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- PROFILE BADGES RLS (awarded badges)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view profile badges" ON profile_badges;
DROP POLICY IF EXISTS "Admin full access to profile_badges" ON profile_badges;
DROP POLICY IF EXISTS "System can insert profile badges" ON profile_badges;

-- Public: Can view all profile badges (read-only)
CREATE POLICY "Public can view profile badges"
  ON profile_badges
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Admin: Full access to profile_badges
CREATE POLICY "Admin full access to profile_badges"
  ON profile_badges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );

-- Note: Badge awarding is done via server actions with admin/service role
-- Regular users cannot insert into profile_badges directly
