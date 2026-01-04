'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized: You must be logged in to upload images');
    }

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('[Image Upload] Error:', error.message);
        throw new Error(error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

    return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
    };
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imagePath: string) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase.storage
        .from('product-images')
        .remove([imagePath]);

    if (error) {
        console.error('[Image Delete] Error:', error.message);
        throw new Error(error.message);
    }

    return { success: true };
}
