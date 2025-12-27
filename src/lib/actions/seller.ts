'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActivationResult = {
    error?: string;
    success?: boolean;
};

// Activate seller capability for current user
export async function activateSeller(
    formData: FormData
): Promise<ActivationResult> {
    const businessName = formData.get('businessName') as string;
    const businessAddress = formData.get('businessAddress') as string;

    if (!businessName) {
        return { error: 'Business name is required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Check if already a seller
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_seller')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.is_seller) {
        return { error: 'Already registered as a seller' };
    }

    // Start transaction: update profile and create seller_profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_seller: true })
        .eq('id', user.id);

    if (profileError) {
        return { error: 'Failed to activate seller capability' };
    }

    // Create seller profile
    const { error: sellerError } = await supabase
        .from('seller_profiles')
        .insert({
            id: user.id,
            business_name: businessName,
            business_address: businessAddress || null,
        });

    if (sellerError) {
        // Rollback profile update
        await supabase
            .from('profiles')
            .update({ is_seller: false })
            .eq('id', user.id);
        return { error: 'Failed to create seller profile' };
    }

    revalidatePath('/');
    return { success: true };
}

// Update seller profile
export async function updateSellerProfile(
    formData: FormData
): Promise<ActivationResult> {
    const businessName = formData.get('businessName') as string;
    const businessAddress = formData.get('businessAddress') as string;
    const businessDescriptionEn = formData.get('businessDescriptionEn') as string;
    const businessDescriptionAr = formData.get('businessDescriptionAr') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('seller_profiles')
        .update({
            business_name: businessName,
            business_address: businessAddress || null,
            business_description_en: businessDescriptionEn || null,
            business_description_ar: businessDescriptionAr || null,
        })
        .eq('id', user.id);

    if (error) {
        return { error: 'Failed to update seller profile' };
    }

    revalidatePath('/');
    return { success: true };
}

// Create a new product
export async function createProduct(
    formData: FormData
): Promise<ActivationResult> {
    const nameEn = formData.get('nameEn') as string;
    const nameAr = formData.get('nameAr') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = parseFloat(formData.get('price') as string);
    const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const categoryId = formData.get('categoryId') as string;
    const images = formData.getAll('images') as string[];

    if (!nameEn || !nameAr || isNaN(price)) {
        return { error: 'Name and price are required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify seller capability
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_seller')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_seller) {
        return { error: 'Not authorized as seller' };
    }

    const { error } = await supabase
        .from('products')
        .insert({
            seller_id: user.id,
            name_en: nameEn,
            name_ar: nameAr,
            description_en: descriptionEn || null,
            description_ar: descriptionAr || null,
            price,
            compare_at_price: compareAtPrice,
            stock,
            category_id: categoryId || null,
            images: images || [],
            is_active: true,
        });

    if (error) {
        console.error('[createProduct]', error);
        return { error: 'Failed to create product' };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Toggle product active status
export async function toggleProductStatus(
    productId: string,
    newStatus?: boolean
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Get current product status if newStatus not provided
    let targetStatus = newStatus;
    if (targetStatus === undefined) {
        const { data: product } = await supabase
            .from('products')
            .select('is_active, seller_id')
            .eq('id', productId)
            .maybeSingle();

        if (!product) {
            return { error: 'Product not found' };
        }

        if (product.seller_id !== user.id) {
            return { error: 'Not authorized' };
        }

        targetStatus = !product.is_active;
    }

    const { error } = await supabase
        .from('products')
        .update({ is_active: targetStatus })
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        return { error: 'Failed to toggle product status' };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Update an existing product
export async function updateProduct(
    productId: string,
    formData: FormData
): Promise<ActivationResult> {
    const nameEn = formData.get('nameEn') as string;
    const nameAr = formData.get('nameAr') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = parseFloat(formData.get('price') as string);
    const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null;
    const stock = parseInt(formData.get('stock') as string) || 0;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('products')
        .update({
            name_en: nameEn,
            name_ar: nameAr,
            description_en: descriptionEn || null,
            description_ar: descriptionAr || null,
            price,
            compare_at_price: compareAtPrice,
            stock,
        })
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        return { error: 'Failed to update product' };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Delete a product
export async function deleteProduct(
    productId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        return { error: 'Failed to delete product' };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// Accept an order (seller)
export async function acceptOrder(
    orderId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId)
        .eq('seller_id', user.id)
        .eq('status', 'placed');

    if (error) {
        return { error: 'Failed to accept order' };
    }

    revalidatePath('/seller/orders');
    return { success: true };
}

// Mark order as preparing
export async function markPreparing(
    orderId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', orderId)
        .eq('seller_id', user.id)
        .eq('status', 'accepted');

    if (error) {
        return { error: 'Failed to update order' };
    }

    revalidatePath('/seller/orders');
    return { success: true };
}

// Mark order as ready for pickup
export async function markReady(
    orderId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Update order to ready
    const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'ready' })
        .eq('id', orderId)
        .eq('seller_id', user.id)
        .eq('status', 'preparing');

    if (orderError) {
        return { error: 'Failed to update order' };
    }

    // Create delivery record
    const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
            order_id: orderId,
            status: 'available',
        });

    if (deliveryError) {
        console.error('[markReady] Failed to create delivery:', deliveryError);
    }

    revalidatePath('/seller/orders');
    return { success: true };
}
