'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const createVariantSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().optional(),
    priceJod: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    isDefault: z.boolean().optional(),
});

const updateVariantSchema = z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    name: z.string().min(1, 'Variant name is required').optional(),
    sku: z.string().optional(),
    priceJod: z.number().min(0, 'Price must be positive').optional(),
    compareAtPrice: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0, 'Stock must be non-negative').optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

// Get variants for a product
export async function getProductVariants(productId: string): Promise<ActionResult<{
    variants: Array<{
        id: string;
        name: string;
        sku: string | null;
        price_jod: number;
        compare_at_price: number | null;
        stock: number;
        is_default: boolean;
        is_active: boolean;
        position: number;
    }>;
}>> {
    const supabase = await createClient();

    const { data: variants, error } = await supabase
        .from('product_variants')
        .select('id, name, sku, price_jod, compare_at_price, stock, is_default, is_active, position')
        .eq('product_id', productId)
        .order('position', { ascending: true });

    if (error) {
        console.error('[getProductVariants] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: { variants: variants || [] } };
}

// Create a variant (seller only)
export async function createVariant(formData: FormData): Promise<ActionResult<{ variantId: string }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const rawData = {
        productId: formData.get('productId') as string,
        name: formData.get('name') as string,
        sku: formData.get('sku') as string || undefined,
        priceJod: parseFloat(formData.get('priceJod') as string),
        compareAtPrice: formData.get('compareAtPrice')
            ? parseFloat(formData.get('compareAtPrice') as string)
            : undefined,
        stock: parseInt(formData.get('stock') as string) || 0,
        isDefault: formData.get('isDefault') === 'true',
    };

    const validation = createVariantSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    // Verify product belongs to seller
    const { data: product } = await supabase
        .from('products')
        .select(`
            id,
            sellers!inner(profile_id)
        `)
        .eq('id', validation.data.productId)
        .maybeSingle();

    if (!product) {
        return { success: false, error: 'Product not found' };
    }

    const sellerData = product.sellers as unknown as { profile_id: string } | null;
    const sellerProfileId = sellerData?.profile_id;
    if (sellerProfileId !== user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get max position
    const { data: maxPos } = await supabase
        .from('product_variants')
        .select('position')
        .eq('product_id', validation.data.productId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

    const position = (maxPos?.position || 0) + 1;

    // Create variant
    const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
            product_id: validation.data.productId,
            name: validation.data.name,
            sku: validation.data.sku || null,
            price_jod: validation.data.priceJod,
            compare_at_price: validation.data.compareAtPrice || null,
            stock: validation.data.stock,
            is_default: validation.data.isDefault || false,
            position,
        })
        .select('id')
        .maybeSingle();

    if (error) {
        console.error('[createVariant] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true, data: { variantId: variant?.id || '' } };
}

// Update a variant (seller only)
export async function updateVariant(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const rawData = {
        variantId: formData.get('variantId') as string,
        name: formData.get('name') as string || undefined,
        sku: formData.get('sku') as string || undefined,
        priceJod: formData.get('priceJod')
            ? parseFloat(formData.get('priceJod') as string)
            : undefined,
        compareAtPrice: formData.get('compareAtPrice')
            ? parseFloat(formData.get('compareAtPrice') as string)
            : null,
        stock: formData.get('stock')
            ? parseInt(formData.get('stock') as string)
            : undefined,
        isDefault: formData.has('isDefault')
            ? formData.get('isDefault') === 'true'
            : undefined,
        isActive: formData.has('isActive')
            ? formData.get('isActive') === 'true'
            : undefined,
    };

    const validation = updateVariantSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    // Verify variant belongs to seller's product
    const { data: variant } = await supabase
        .from('product_variants')
        .select(`
            id,
            products!inner(
                sellers!inner(profile_id)
            )
        `)
        .eq('id', validation.data.variantId)
        .maybeSingle();

    if (!variant) {
        return { success: false, error: 'Variant not found' };
    }

    const productData = variant.products as unknown as { sellers: { profile_id: string } } | null;
    const sellerProfileId = productData?.sellers?.profile_id;
    if (sellerProfileId !== user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.sku !== undefined) updateData.sku = validation.data.sku;
    if (validation.data.priceJod !== undefined) updateData.price_jod = validation.data.priceJod;
    if (validation.data.compareAtPrice !== undefined) updateData.compare_at_price = validation.data.compareAtPrice;
    if (validation.data.stock !== undefined) updateData.stock = validation.data.stock;
    if (validation.data.isDefault !== undefined) updateData.is_default = validation.data.isDefault;
    if (validation.data.isActive !== undefined) updateData.is_active = validation.data.isActive;

    const { error } = await supabase
        .from('product_variants')
        .update(updateData)
        .eq('id', validation.data.variantId);

    if (error) {
        console.error('[updateVariant] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Delete a variant (seller only, cannot delete default variant if it's the only one)
export async function deleteVariant(variantId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get variant with product info
    const { data: variant } = await supabase
        .from('product_variants')
        .select(`
            id,
            product_id,
            is_default,
            products!inner(
                sellers!inner(profile_id)
            )
        `)
        .eq('id', variantId)
        .maybeSingle();

    if (!variant) {
        return { success: false, error: 'Variant not found' };
    }

    const productData = variant.products as unknown as { sellers: { profile_id: string } } | null;
    const sellerProfileId = productData?.sellers?.profile_id;
    if (sellerProfileId !== user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if trying to delete the only variant
    const { count } = await supabase
        .from('product_variants')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', variant.product_id);

    if (count === 1) {
        return { success: false, error: 'Cannot delete the only variant' };
    }

    // If deleting default, assign default to another variant
    if (variant.is_default) {
        const { data: anotherVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', variant.product_id)
            .neq('id', variantId)
            .limit(1)
            .maybeSingle();

        if (anotherVariant) {
            await supabase
                .from('product_variants')
                .update({ is_default: true })
                .eq('id', anotherVariant.id);
        }
    }

    // Delete variant
    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

    if (error) {
        console.error('[deleteVariant] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Get default variant for a product
export async function getDefaultVariant(productId: string): Promise<ActionResult<{
    variant: {
        id: string;
        name: string;
        price_jod: number;
        stock: number;
    } | null;
}>> {
    const supabase = await createClient();

    const { data: variant, error } = await supabase
        .from('product_variants')
        .select('id, name, price_jod, stock')
        .eq('product_id', productId)
        .eq('is_default', true)
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        console.error('[getDefaultVariant] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: { variant } };
}
