'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
    success: boolean;
    error?: string;
    data?: unknown;
};

// ============================================
// Product Actions (Seller)
// ============================================

export async function createProduct(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user.id)
        .single();

    if (!seller || seller.status !== 'approved') {
        return { success: false, error: 'Not an approved seller' };
    }

    const productData = {
        seller_id: seller.id,
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        description_en: formData.get('description_en') as string || null,
        description_ar: formData.get('description_ar') as string || null,
        price: parseFloat(formData.get('price') as string),
        compare_at_price: formData.get('compare_at_price')
            ? parseFloat(formData.get('compare_at_price') as string)
            : null,
        stock: parseInt(formData.get('stock') as string) || 0,
        category_id: formData.get('category_id') as string || null,
        is_active: formData.get('is_active') === 'true',
    };

    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

    if (error) {
        console.error('Create product error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true, data };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    // Verify ownership
    const { data: product } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

    if (product?.seller_id !== seller.id) {
        return { success: false, error: 'Not authorized' };
    }

    const updateData = {
        title_en: formData.get('title_en') as string,
        title_ar: formData.get('title_ar') as string,
        description_en: formData.get('description_en') as string || null,
        description_ar: formData.get('description_ar') as string || null,
        price: parseFloat(formData.get('price') as string),
        compare_at_price: formData.get('compare_at_price')
            ? parseFloat(formData.get('compare_at_price') as string)
            : null,
        stock: parseInt(formData.get('stock') as string) || 0,
        category_id: formData.get('category_id') as string || null,
        is_active: formData.get('is_active') === 'true',
    };

    const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

    if (error) {
        console.error('Update product error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

export async function toggleProductActive(productId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    const { data: product } = await supabase
        .from('products')
        .select('seller_id, is_active')
        .eq('id', productId)
        .single();

    if (!product || product.seller_id !== seller.id) {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', productId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    const { data: product } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

    if (product?.seller_id !== seller.id) {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

// ============================================
// Order Actions (Seller)
// ============================================

export async function acceptOrder(orderId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify seller owns items in this order
    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    // Update order status to preparing
    const { error } = await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', orderId)
        .eq('status', 'pending_seller');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/orders');
    return { success: true };
}

export async function markOrderReady(orderId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('orders')
        .update({ status: 'ready_for_pickup' })
        .eq('id', orderId)
        .eq('status', 'preparing');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/orders');
    return { success: true };
}
