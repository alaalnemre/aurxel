-- =====================================================
-- JordanMarket Database Schema - Phase 3
-- Product Catalog & Seller Inventory
-- =====================================================

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
-- Anyone can read active categories
CREATE POLICY "Anyone can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admin can read all categories
CREATE POLICY "Admin can read all categories"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert categories
CREATE POLICY "Admin can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update categories
CREATE POLICY "Admin can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete categories
CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Sellers can read all their own products (including inactive)
CREATE POLICY "Sellers can read own products"
  ON products FOR SELECT
  USING (auth.uid() = seller_id);

-- Admin can read all products
CREATE POLICY "Admin can read all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sellers can insert their own products
CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'seller'
    ) AND
    EXISTS (
      SELECT 1 FROM seller_profiles 
      WHERE user_id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Admin can update all products
CREATE POLICY "Admin can update all products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);

-- Admin can delete all products
CREATE POLICY "Admin can delete all products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images
-- Anyone can read images for active products
CREATE POLICY "Anyone can read product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND is_active = true
    )
  );

-- Sellers can read images for their products
CREATE POLICY "Sellers can read own product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND seller_id = auth.uid()
    )
  );

-- Admin can read all images
CREATE POLICY "Admin can read all product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sellers can insert images for their products
CREATE POLICY "Sellers can insert own product images"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND seller_id = auth.uid()
    )
  );

-- Sellers can update images for their products
CREATE POLICY "Sellers can update own product images"
  ON product_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND seller_id = auth.uid()
    )
  );

-- Sellers can delete images for their products
CREATE POLICY "Sellers can delete own product images"
  ON product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND seller_id = auth.uid()
    )
  );

-- Admin can manage all images
CREATE POLICY "Admin can insert all product images"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update all product images"
  ON product_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete all product images"
  ON product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGER FOR PRODUCTS
-- =====================================================

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- =====================================================
-- SEED DEFAULT CATEGORIES
-- =====================================================

INSERT INTO categories (name_en, name_ar, slug, icon, sort_order) VALUES
  ('Electronics', 'إلكترونيات', 'electronics', '📱', 1),
  ('Fashion', 'أزياء', 'fashion', '👕', 2),
  ('Home & Garden', 'المنزل والحديقة', 'home-garden', '🏠', 3),
  ('Sports & Outdoors', 'رياضة ونشاطات خارجية', 'sports-outdoors', '⚽', 4),
  ('Beauty & Health', 'الجمال والصحة', 'beauty-health', '💄', 5),
  ('Toys & Games', 'ألعاب', 'toys-games', '🎮', 6),
  ('Books & Stationery', 'كتب وقرطاسية', 'books-stationery', '📚', 7),
  ('Automotive', 'سيارات', 'automotive', '🚗', 8),
  ('Food & Groceries', 'طعام وبقالة', 'food-groceries', '🍎', 9),
  ('Other', 'أخرى', 'other', '📦', 10);

-- =====================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- =====================================================

-- Note: Run this in Supabase Dashboard > Storage
-- CREATE BUCKET product-images WITH public = true;
