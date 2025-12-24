-- ============================================
-- Migration 012: Seed Data
-- Initial categories and admin user setup
-- ============================================

-- ============================================
-- SEED CATEGORIES
-- ============================================

INSERT INTO categories (name_en, name_ar, slug, sort_order) VALUES
  ('Electronics', 'إلكترونيات', 'electronics', 1),
  ('Fashion', 'أزياء', 'fashion', 2),
  ('Home & Garden', 'المنزل والحديقة', 'home-garden', 3),
  ('Health & Beauty', 'الصحة والجمال', 'health-beauty', 4),
  ('Sports & Outdoors', 'الرياضة والهواء الطلق', 'sports-outdoors', 5),
  ('Books & Media', 'الكتب والوسائط', 'books-media', 6),
  ('Toys & Games', 'الألعاب', 'toys-games', 7),
  ('Food & Beverages', 'الطعام والمشروبات', 'food-beverages', 8),
  ('Automotive', 'السيارات', 'automotive', 9),
  ('Services', 'الخدمات', 'services', 10);

-- Subcategories for Electronics
INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Phones & Tablets', 'الهواتف والأجهزة اللوحية', 'phones-tablets', id, 1
FROM categories WHERE slug = 'electronics';

INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Computers & Laptops', 'الكمبيوترات والحواسيب المحمولة', 'computers-laptops', id, 2
FROM categories WHERE slug = 'electronics';

INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Audio & Headphones', 'الصوتيات وسماعات الرأس', 'audio-headphones', id, 3
FROM categories WHERE slug = 'electronics';

-- Subcategories for Fashion
INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Men''s Clothing', 'ملابس رجالية', 'mens-clothing', id, 1
FROM categories WHERE slug = 'fashion';

INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Women''s Clothing', 'ملابس نسائية', 'womens-clothing', id, 2
FROM categories WHERE slug = 'fashion';

INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Kids'' Clothing', 'ملابس أطفال', 'kids-clothing', id, 3
FROM categories WHERE slug = 'fashion';

INSERT INTO categories (name_en, name_ar, slug, parent_id, sort_order)
SELECT 'Shoes', 'أحذية', 'shoes', id, 4
FROM categories WHERE slug = 'fashion';

-- ============================================
-- ADMIN USER SETUP INSTRUCTIONS
-- ============================================

-- To create an admin user:
-- 1. Register a new user through the application
-- 2. Find the user's ID in auth.users table
-- 3. Run the following SQL (replace USER_ID with actual ID):

-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';

-- Or create a function that can be called to promote a user to admin:
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  -- Update role to admin
  UPDATE profiles SET role = 'admin' WHERE id = v_user_id;
  
  RAISE NOTICE 'User % promoted to admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage: SELECT promote_to_admin('admin@example.com');
