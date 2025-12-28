-- =====================================================
-- 001_enums.sql
-- Create all enum types for JordanMarket
-- =====================================================

-- Order status lifecycle enum
CREATE TYPE order_status AS ENUM (
  'placed',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'picked_up',
  'delivered',
  'completed',
  'cancelled'
);

-- Delivery status lifecycle enum
CREATE TYPE delivery_status AS ENUM (
  'available',
  'assigned',
  'picked_up',
  'delivered'
);

-- Seller verification status enum
CREATE TYPE seller_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Driver verification status enum
CREATE TYPE driver_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Dispute status enum
CREATE TYPE dispute_status AS ENUM (
  'open',
  'investigating',
  'resolved',
  'rejected'
);
