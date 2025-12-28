-- =====================================================
-- 020_featured_entities.sql
-- Featured stores and products system for promotions
-- =====================================================

-- Featured entity type enum
DO $$ BEGIN
  CREATE TYPE featured_entity_type AS ENUM ('store', 'product');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Featured entities table
CREATE TABLE IF NOT EXISTS featured_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity type and references
  entity_type featured_entity_type NOT NULL,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Optional display overrides
  title_override TEXT,
  subtitle_override TEXT,
  image_override TEXT,
  
  -- Priority for ordering (higher = first)
  priority INTEGER DEFAULT 0 NOT NULL,
  
  -- Scheduling
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints: ensure correct reference based on entity_type
  CONSTRAINT valid_store_reference CHECK (
    (entity_type = 'store' AND seller_id IS NOT NULL AND product_id IS NULL) OR
    (entity_type = 'product' AND product_id IS NOT NULL AND seller_id IS NULL)
  ),
  
  -- Ensure date range is valid
  CONSTRAINT valid_date_range CHECK (
    ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at
  )
);

-- Enable RLS
ALTER TABLE featured_entities ENABLE ROW LEVEL SECURITY;

-- Unique constraints to prevent duplicate features
CREATE UNIQUE INDEX IF NOT EXISTS idx_featured_unique_store 
  ON featured_entities(entity_type, seller_id) 
  WHERE seller_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_featured_unique_product 
  ON featured_entities(entity_type, product_id) 
  WHERE product_id IS NOT NULL;

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_featured_entities_type_active 
  ON featured_entities(entity_type, is_active);
CREATE INDEX IF NOT EXISTS idx_featured_entities_priority 
  ON featured_entities(priority DESC);
CREATE INDEX IF NOT EXISTS idx_featured_entities_dates 
  ON featured_entities(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_featured_entities_created_by 
  ON featured_entities(created_by);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_featured_entities_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_featured_entities_updated_at ON featured_entities;
CREATE TRIGGER trigger_featured_entities_updated_at
  BEFORE UPDATE ON featured_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_entities_updated_at();
