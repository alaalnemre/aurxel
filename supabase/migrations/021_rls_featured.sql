-- =====================================================
-- 021_rls_featured.sql
-- Row Level Security policies for featured entities
-- =====================================================

-- =====================================================
-- FEATURED ENTITIES RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active featured entities" ON featured_entities;
DROP POLICY IF EXISTS "Admin full access to featured_entities" ON featured_entities;

-- Public/Authenticated: Can view active featured entities within valid date range
CREATE POLICY "Public can view active featured entities"
  ON featured_entities
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

-- Admin: Full access to featured_entities
CREATE POLICY "Admin full access to featured_entities"
  ON featured_entities
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
