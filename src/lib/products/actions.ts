'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import type { Product, ProductWithDetails, Category } from '@/lib/types/database';

export interface ProductActionResult {
    success: boolean;
    error?: string;
    product?: Product;
}

/**
 * Get all products for the current seller
 */
export async function getSellerProducts(): Promise<ProductWithDetails[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getSellerProducts] Error:', error);
        return [];
    }

    return (data || []) as ProductWithDetails[];
}

/**
 * Get a single product by ID for editing (seller only)
 */
export async function getProductForEdit(
    productId: string
): Promise<ProductWithDetails | null> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
        .eq('id', productId)
        .eq('seller_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getProductForEdit] Error:', error);
        return null;
    }

    return data as ProductWithDetails | null;
}

/**
 * Create a new product
 */
export async function createProduct(
    formData: FormData
): Promise<ProductActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'seller') {
        return { success: false, error: 'Not authorized' };
    }

    const name = formData.get('name') as string;
    const nameAr = formData.get('nameAr') as string;
    const description = formData.get('description') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = parseFloat(formData.get('price') as string);
    const compareAtPrice = formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : null;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const categoryId = formData.get('categoryId') as string;
    const sku = formData.get('sku') as string;

    if (!name?.trim()) {
        return { success: false, error: 'Product name is required' };
    }

    if (isNaN(price) || price < 0) {
        return { success: false, error: 'Valid price is required' };
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            seller_id: user.id,
            name: name.trim(),
            name_ar: nameAr?.trim() || null,
            description: description?.trim() || null,
            description_ar: descriptionAr?.trim() || null,
            price,
            compare_at_price: compareAtPrice,
            stock,
            category_id: categoryId || null,
            sku: sku?.trim() || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error('[createProduct] Error:', error);
        return { success: false, error: 'Failed to create product' };
    }

    revalidatePath(`/${locale}/seller/products`);
    redirect({ href: `/seller/products/${data.id}/edit`, locale });

    return { success: true, product: data };
}

/**
 * Update an existing product
 */
export async function updateProduct(
    productId: string,
    formData: FormData
): Promise<ProductActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'seller') {
        return { success: false, error: 'Not authorized' };
    }

    const name = formData.get('name') as string;
    const nameAr = formData.get('nameAr') as string;
    const description = formData.get('description') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = parseFloat(formData.get('price') as string);
    const compareAtPrice = formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : null;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const categoryId = formData.get('categoryId') as string;
    const sku = formData.get('sku') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!name?.trim()) {
        return { success: false, error: 'Product name is required' };
    }

    if (isNaN(price) || price < 0) {
        return { success: false, error: 'Valid price is required' };
    }

    const { data, error } = await supabase
        .from('products')
        .update({
            name: name.trim(),
            name_ar: nameAr?.trim() || null,
            description: description?.trim() || null,
            description_ar: descriptionAr?.trim() || null,
            price,
            compare_at_price: compareAtPrice,
            stock,
            category_id: categoryId || null,
            sku: sku?.trim() || null,
            is_active: isActive,
        })
        .eq('id', productId)
        .eq('seller_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('[updateProduct] Error:', error);
        return { success: false, error: 'Failed to update product' };
    }

    revalidatePath(`/${locale}/seller/products`);
    revalidatePath(`/${locale}/seller/products/${productId}/edit`);

    return { success: true, product: data };
}

/**
 * Toggle product active status
 */
export async function toggleProductStatus(
    productId: string,
    isActive: boolean
): Promise<ProductActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user } = await getProfile();

    if (!user) {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        console.error('[toggleProductStatus] Error:', error);
        return { success: false, error: 'Failed to update product status' };
    }

    revalidatePath(`/${locale}/seller/products`);

    return { success: true };
}

/**
 * Delete a product
 */
export async function deleteProduct(
    productId: string
): Promise<ProductActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user } = await getProfile();

    if (!user) {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        console.error('[deleteProduct] Error:', error);
        return { success: false, error: 'Failed to delete product' };
    }

    revalidatePath(`/${locale}/seller/products`);

    return { success: true };
}

/**
 * Get all active categories
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('[getCategories] Error:', error);
        return [];
    }

    return (data || []) as Category[];
}

/**
 * Get products for buyer catalog (public)
 */
export async function getCatalogProducts(options?: {
    categorySlug?: string;
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ products: ProductWithDetails[]; total: number }> {
    const supabase = await createClient();

    let query = supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      images:product_images(*),
      seller:profiles(id, full_name)
    `, { count: 'exact' })
        .eq('is_active', true)
        .gt('stock', 0);

    if (options?.categorySlug) {
        const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', options.categorySlug)
            .maybeSingle();

        if (category) {
            query = query.eq('category_id', category.id);
        }
    }

    if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    query = query
        .order('created_at', { ascending: false })
        .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('[getCatalogProducts] Error:', error);
        return { products: [], total: 0 };
    }

    return {
        products: (data || []) as ProductWithDetails[],
        total: count || 0
    };
}

/**
 * Get a single product for public view
 */
export async function getProductDetails(
    productId: string
): Promise<ProductWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      images:product_images(*),
      seller:profiles(id, full_name)
    `)
        .eq('id', productId)
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        console.error('[getProductDetails] Error:', error);
        return null;
    }

    // Increment view count
    if (data) {
        await supabase
            .from('products')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', productId);
    }

    return data as ProductWithDetails | null;
}
