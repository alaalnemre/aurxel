'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Approve a vendor and mark them as verified
 */
export async function approveVendor(formData: FormData) {
    const supabase = await createClient();
    const vendorId = formData.get('vendorId') as string;

    if (!vendorId) {
        throw new Error('Vendor ID is required');
    }

    const { error } = await supabase
        .from('vendors')
        .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
        })
        .eq('id', vendorId);

    if (error) {
        console.error('[Admin] Approve vendor error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/admin/vendors', 'page');
}

/**
 * Verify a driver
 */
export async function verifyDriver(formData: FormData) {
    const supabase = await createClient();
    const driverId = formData.get('driverId') as string;

    if (!driverId) {
        throw new Error('Driver ID is required');
    }

    // Update driver profile or create driver-specific verification record
    const { error } = await supabase
        .from('profiles')
        .update({
            // You might want to add a is_verified field to profiles
            // or create a separate drivers table
            updated_at: new Date().toISOString(),
        })
        .eq('id', driverId)
        .eq('role', 'driver');

    if (error) {
        console.error('[Admin] Verify driver error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/admin/drivers', 'page');
}

/**
 * Toggle product active status
 */
export async function toggleProductStatus(formData: FormData) {
    const supabase = await createClient();
    const productId = formData.get('productId') as string;
    const currentStatus = formData.get('currentStatus') === 'true';

    if (!productId) {
        throw new Error('Product ID is required');
    }

    const { error } = await supabase
        .from('products')
        .update({
            is_active: !currentStatus,
        })
        .eq('id', productId);

    if (error) {
        console.error('[Admin] Toggle product status error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/admin/products', 'page');
}

/**
 * Get platform statistics
 */
export async function getPlatformStats() {
    const supabase = await createClient();

    const [vendorsResult, productsResult, ordersResult, driversResult] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'driver'),
    ]);

    return {
        vendorsCount: vendorsResult.count || 0,
        productsCount: productsResult.count || 0,
        ordersCount: ordersResult.count || 0,
        driversCount: driversResult.count || 0,
    };
}
