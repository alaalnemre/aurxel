-- ============================================
-- Migration 004: Ratings and Reviews
-- Buyer ratings for sellers and drivers
-- ============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each order can have one rating per target (seller or driver)
  UNIQUE(order_id, seller_id),
  UNIQUE(order_id, driver_id),
  -- Must rate either seller or driver
  CONSTRAINT rating_target_check CHECK (
    (seller_id IS NOT NULL AND driver_id IS NULL) OR
    (seller_id IS NULL AND driver_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_ratings_order_id ON ratings(order_id);
CREATE INDEX idx_ratings_buyer_id ON ratings(buyer_id);
CREATE INDEX idx_ratings_seller_id ON ratings(seller_id);
CREATE INDEX idx_ratings_driver_id ON ratings(driver_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
