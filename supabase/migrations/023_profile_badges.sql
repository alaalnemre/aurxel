-- =====================================================
-- 023_profile_badges.sql
-- Profile badges junction table for awarded badges
-- =====================================================

-- Profile badges table (tracks awarded badges)
CREATE TABLE IF NOT EXISTS profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  -- Award details
  awarded_reason TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: each profile can only earn each badge once
  CONSTRAINT unique_profile_badge UNIQUE (profile_id, badge_id)
);

-- Enable RLS
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_badges_profile_id ON profile_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_badge_id ON profile_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_awarded_at ON profile_badges(awarded_at DESC);
