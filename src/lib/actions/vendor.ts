'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { VendorOnboardingFormData, ProductFormData } from '@/lib/types/database';

/**
 * Create vendor profile from onboarding form
 */
export async function createVendor(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const vendorData: VendorOnboardingFormData = {
        business_name: formData.get('business_name') as string,
        business_name_ar: formData.get('business_name_ar') as string || undefined,
        category: formData.get('category') as any,
        description: formData.get('description') as string || undefined,
        description_ar: formData.get('description_ar') as string || undefined,
        business_phone: formData.get('business_phone') as string,
        business_email: formData.get('business_email') as string || undefined,
        business_address: formData.get('business_address') as string,
        business_address_ar: formData.get('business_address_ar') as string || undefined,
        commercial_license: formData.get('commercial_license') as string || undefined,
        tax_number: formData.get('tax_number') as string || undefined,
    };

    const { error } = await supabase.from('vendors').insert({
        user_id: user.id,
        ...vendorData,
    });

    if (error) {
        console.error('[Vendor] Create vendor error:', error.message);
        throw new Error(error.message);
    }

    redirect('/ar/vendor');
}

/**
 * Create a new product
 */
export async function createProduct(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // Get vendor ID
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!vendor) {
        throw new Error('Vendor profile not found');
    }

    const productData = {
        vendor_id: vendor.id,
        name: formData.get('name') as string,
        name_ar: formData.get('name_ar') as string || null,
        description: formData.get('description') as string || null,
        description_ar: formData.get('description_ar') as string || null,
        category: formData.get('category') as string,
        subcategory: formData.get('subcategory') as string || null,
        price: parseFloat(formData.get('price') as string),
        compare_at_price: formData.get('compare_at_price')
            ? parseFloat(formData.get('compare_at_price') as string)
            : null,
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        sku: formData.get('sku') as string || null,
        image_url: formData.get('image_url') as string || null,
        is_active: formData.get('is_active') === 'true',
        is_featured: formData.get('is_featured') === 'true',
    };

    const { error } = await supabase.from('products').insert(productData);

    if (error) {
        console.error('[Vendor] Create product error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/vendor/products', 'page');
    redirect('/ar/vendor/products');
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const productData = {
        name: formData.get('name') as string,
        name_ar: formData.get('name_ar') as string || null,
        description: formData.get('description') as string || null,
        description_ar: formData.get('description_ar') as string || null,
        category: formData.get('category') as string,
        subcategory: formData.get('subcategory') as string || null,
        price: parseFloat(formData.get('price') as string),
        compare_at_price: formData.get('compare_at_price')
            ? parseFloat(formData.get('compare_at_price') as string)
            : null,
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        sku: formData.get('sku') as string || null,
        image_url: formData.get('image_url') as string || null,
        is_active: formData.get('is_active') === 'true',
        is_featured: formData.get('is_featured') === 'true',
    };

    const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

    if (error) {
        console.error('[Vendor] Update product error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/vendor/products', 'page');
    redirect('/ar/vendor/products');
}

/**
 * Delete a product
 */
export async function deleteProduct(formData: FormData) {
    const supabase = await createClient();
    const productId = formData.get('productId') as string;

    if (!productId) {
        throw new Error('Product ID is required');
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('[Vendor] Delete product error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/vendor/products', 'page');
}

/**
 * Update order status
 */
export async function updateOrderStatus(formData: FormData) {
    const supabase = await createClient();
    const orderId = formData.get('orderId') as string;
    const newStatus = formData.get('status') as string;

    if (!orderId || !newStatus) {
        throw new Error('Order ID and status are required');
    }

    const updateData: any = { status: newStatus };

    // Update timestamp based on status
    switch (newStatus) {
        case 'confirmed':
            updateData.confirmed_at = new Date().toISOString();
            break;
        case 'preparing':
            updateData.preparing_at = new Date().toISOString();
            break;
        case 'ready':
            updateData.ready_at = new Date().toISOString();
            break;
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error('[Vendor] Update order status error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/vendor/orders', 'page');
}
