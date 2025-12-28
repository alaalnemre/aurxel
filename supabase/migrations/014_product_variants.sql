-- =====================================================
-- 014_product_variants.sql
-- Product variants system
-- =====================================================

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price_jod NUMERIC(10,2) NOT NULL CHECK (price_jod >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_default ON product_variants(product_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;

-- Ensure each product has exactly one default variant
CREATE OR REPLACE FUNCTION ensure_single_default_variant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Unset other defaults for this product
    UPDATE product_variants
    SET is_default = FALSE
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_single_default_variant ON product_variants;
CREATE TRIGGER trigger_ensure_single_default_variant
  BEFORE INSERT OR UPDATE ON product_variants
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_variant();

-- Add variant_id to order_items (nullable for backward compatibility)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;

-- Add variant_name_snapshot to order_items
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_name_snapshot TEXT;

-- Add variant_id to cart_items
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- Update cart_items unique constraint to include variant
-- First drop the old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cart_items_cart_id_product_id_key'
  ) THEN
    ALTER TABLE cart_items DROP CONSTRAINT cart_items_cart_id_product_id_key;
  END IF;
END$$;

-- Create new unique constraint including variant
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_variant_unique 
  ON cart_items(cart_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Function to create default variant when product is created
CREATE OR REPLACE FUNCTION create_default_variant_for_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO product_variants (product_id, name, price_jod, stock, is_default)
  VALUES (NEW.id, 'Default', NEW.price_jod, NEW.stock, TRUE);
  RETURN NEW;
END;
$$;

-- Trigger to create default variant
DROP TRIGGER IF EXISTS on_product_created_create_variant ON products;
CREATE TRIGGER on_product_created_create_variant
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION create_default_variant_for_product();
