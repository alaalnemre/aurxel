-- =====================================================
-- 022_badges.sql
-- Badges system for gamification and trust building
-- =====================================================

-- Badge applies_to enum
DO $$ BEGIN
  CREATE TYPE badge_applies_to AS ENUM ('buyer', 'seller', 'driver');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Badges table (badge definitions)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Unique key for badge identification in code
  key TEXT UNIQUE NOT NULL,
  
  -- Localized titles
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  
  -- Localized descriptions
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  
  -- Icon reference (icon name or emoji)
  icon TEXT NOT NULL DEFAULT '🏆',
  
  -- Who can earn this badge
  applies_to badge_applies_to NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_badges_applies_to ON badges(applies_to);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(key);

-- Seed initial badges
INSERT INTO badges (key, title_en, title_ar, description_en, description_ar, icon, applies_to) VALUES
  (
    'trusted_buyer',
    'Trusted Buyer',
    'مشتري موثوق',
    'Completed 5+ orders with no disputes',
    'أكمل 5+ طلبات بدون نزاعات',
    '⭐',
    'buyer'
  ),
  (
    'loyal_customer',
    'Loyal Customer',
    'عميل وفي',
    'Completed 10+ orders on the platform',
    'أكمل 10+ طلبات على المنصة',
    '💎',
    'buyer'
  ),
  (
    'top_seller',
    'Top Seller',
    'بائع متميز',
    'Sold 20+ orders with 4.5+ rating',
    'باع 20+ طلب بتقييم 4.5+',
    '🏆',
    'seller'
  ),
  (
    'rising_star',
    'Rising Star',
    'نجم صاعد',
    'Sold 5+ orders with positive reviews',
    'باع 5+ طلبات بتقييمات إيجابية',
    '🌟',
    'seller'
  ),
  (
    'fast_driver',
    'Fast Driver',
    'سائق سريع',
    'Average delivery time under 30 minutes',
    'متوسط وقت التوصيل أقل من 30 دقيقة',
    '⚡',
    'driver'
  ),
  (
    'reliable_driver',
    'Reliable Driver',
    'سائق موثوق',
    'Completed 20+ deliveries with no issues',
    'أكمل 20+ توصيلة بدون مشاكل',
    '🚀',
    'driver'
  )
ON CONFLICT (key) DO NOTHING;
