-- JordanMarket Seed Data
-- Run this after the initial schema migration

-- Create admin user (requires an auth.users entry first via Supabase dashboard)
-- After creating a user in Supabase Auth, run this to make them admin:

-- UPDATE profiles SET is_admin = true WHERE email = 'admin@jordanmarket.com';

-- Sample Categories (for product organization)
-- Categories are stored as text on products, here are suggested values:
-- electronics, clothing, home, food, beauty, sports, books, toys, automotive, other

-- Sample Discount Code
INSERT INTO discounts (code, description, discount_type, discount_value, min_order_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount - 10% off first order', 'percentage', 10, 5.00, 1000, NOW(), NOW() + INTERVAL '1 year', true),
  ('JORDAN2024', 'Jordan special - 5 JOD off orders over 20 JOD', 'fixed', 5, 20.00, 500, NOW(), NOW() + INTERVAL '6 months', true);

-- Note: Products, orders, and other data will be created through the application.
-- The database triggers will automatically create:
-- - Profile when a user registers
-- - Buyer record (default capability)
-- - Wallet
-- - Cart

-- To create a test seller (after user registration):
-- 1. User registers through the app
-- 2. User applies to become seller through /become-seller
-- 3. Admin approves through /admin/verifications

-- To create sample products:
-- 1. Seller is verified
-- 2. Seller adds products through /seller/products/new
