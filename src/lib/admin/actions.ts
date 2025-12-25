'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import type { Product, ProductWithDetails, Category } from '@/lib/types/database';

export interface AdminActionResult {
    success: boolean;
    error?: string;
}

/**
 * Get all products for admin
 */
export async function getAdminProducts(): Promise<ProductWithDetails[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      images:product_images(*),
      seller:profiles(id, full_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAdminProducts] Error:', error);
        return [];
    }

    return (data || []) as ProductWithDetails[];
}

/**
 * Admin toggle product status
 */
export async function adminToggleProductStatus(
    productId: string,
    isActive: boolean
): Promise<AdminActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);

    if (error) {
        console.error('[adminToggleProductStatus] Error:', error);
        return { success: false, error: 'Failed to update product status' };
    }

    revalidatePath(`/${locale}/admin/products`);

    return { success: true };
}

/**
 * Get all categories for admin
 */
export async function getAdminCategories(): Promise<Category[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('[getAdminCategories] Error:', error);
        return [];
    }

    return (data || []) as Category[];
}

/**
 * Create a new category
 */
export async function createCategory(
    formData: FormData
): Promise<AdminActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const nameEn = formData.get('nameEn') as string;
    const nameAr = formData.get('nameAr') as string;
    const slug = formData.get('slug') as string;
    const icon = formData.get('icon') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!nameEn?.trim() || !nameAr?.trim() || !slug?.trim()) {
        return { success: false, error: 'Name (EN), Name (AR), and Slug are required' };
    }

    const { error } = await supabase.from('categories').insert({
        name_en: nameEn.trim(),
        name_ar: nameAr.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        icon: icon?.trim() || null,
        sort_order: sortOrder,
        is_active: true,
    });

    if (error) {
        console.error('[createCategory] Error:', error);
        if (error.code === '23505') {
            return { success: false, error: 'Category with this slug already exists' };
        }
        return { success: false, error: 'Failed to create category' };
    }

    revalidatePath(`/${locale}/admin/categories`);

    return { success: true };
}

/**
 * Update a category
 */
export async function updateCategory(
    categoryId: string,
    formData: FormData
): Promise<AdminActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const nameEn = formData.get('nameEn') as string;
    const nameAr = formData.get('nameAr') as string;
    const slug = formData.get('slug') as string;
    const icon = formData.get('icon') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    if (!nameEn?.trim() || !nameAr?.trim() || !slug?.trim()) {
        return { success: false, error: 'Name (EN), Name (AR), and Slug are required' };
    }

    const { error } = await supabase
        .from('categories')
        .update({
            name_en: nameEn.trim(),
            name_ar: nameAr.trim(),
            slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
            icon: icon?.trim() || null,
            sort_order: sortOrder,
            is_active: isActive,
        })
        .eq('id', categoryId);

    if (error) {
        console.error('[updateCategory] Error:', error);
        return { success: false, error: 'Failed to update category' };
    }

    revalidatePath(`/${locale}/admin/categories`);

    return { success: true };
}

/**
 * Delete a category
 */
export async function deleteCategory(
    categoryId: string
): Promise<AdminActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) {
        console.error('[deleteCategory] Error:', error);
        return { success: false, error: 'Failed to delete category' };
    }

    revalidatePath(`/${locale}/admin/categories`);

    return { success: true };
}
