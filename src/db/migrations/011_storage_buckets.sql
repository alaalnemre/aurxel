-- ============================================
-- Migration 011: Storage Buckets
-- Creates storage buckets and policies for files
-- ============================================

-- Note: This SQL is for documentation. Storage buckets 
-- should be created via Supabase Dashboard or CLI.
-- The policies below define access control.

-- ============================================
-- PRODUCT IMAGES BUCKET
-- Public read, sellers can upload for their products
-- ============================================

-- Create bucket (run in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true);

-- Policy: Anyone can view product images
-- CREATE POLICY "Public read product images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'product-images');

-- Policy: Authenticated sellers can upload
-- CREATE POLICY "Sellers can upload product images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'product-images' AND
--   auth.role() = 'authenticated' AND
--   EXISTS (
--     SELECT 1 FROM public.sellers 
--     WHERE user_id = auth.uid() AND status = 'approved'
--   )
-- );

-- Policy: Sellers can delete their own images
-- CREATE POLICY "Sellers can delete own product images"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'product-images' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ============================================
-- KYC DOCUMENTS BUCKET
-- Private, only owner and admin can access
-- ============================================

-- Create bucket (run in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('kyc-documents', 'kyc-documents', false);

-- Policy: Users can upload their own KYC documents
-- CREATE POLICY "Users can upload own KYC docs"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'kyc-documents' AND
--   auth.role() = 'authenticated' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can view their own KYC documents
-- CREATE POLICY "Users can view own KYC docs"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'kyc-documents' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Admins can view all KYC documents
-- CREATE POLICY "Admins can view all KYC docs"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'kyc-documents' AND
--   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- ============================================
-- AVATARS BUCKET
-- Public read, users can manage their own
-- ============================================

-- Create bucket (run in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- Policy: Anyone can view avatars
-- CREATE POLICY "Public read avatars"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
-- CREATE POLICY "Users can upload own avatar"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   auth.role() = 'authenticated' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can update their own avatar
-- CREATE POLICY "Users can update own avatar"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can delete their own avatar
-- CREATE POLICY "Users can delete own avatar"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
