'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Platform Settings Server Actions
 * Admin-only actions for managing platform configuration
 */

export interface PlatformSettings {
    platform_fee_rate: number;
    default_delivery_fee: number;
}

export interface SettingsActionResult {
    error?: string;
    success?: boolean;
    data?: PlatformSettings;
}

// ============================================
// GET SETTINGS
// ============================================

/**
 * Get all platform settings (Admin only)
 */
export async function getPlatformSettings(): Promise<{ data: PlatformSettings | null; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: 'Not authenticated' };
    }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { data: null, error: 'Admin access required' };
    }

    const { data: settings, error } = await supabase
        .from('platform_settings')
        .select('key, value');

    if (error) {
        console.error('[getPlatformSettings]', error);
        return { data: null, error: error.message };
    }

    // Convert to object
    const settingsObj: PlatformSettings = {
        platform_fee_rate: 0.05,
        default_delivery_fee: 2.00,
    };

    settings?.forEach((s: { key: string; value: string }) => {
        if (s.key === 'platform_fee_rate') {
            settingsObj.platform_fee_rate = parseFloat(s.value);
        } else if (s.key === 'default_delivery_fee') {
            settingsObj.default_delivery_fee = parseFloat(s.value);
        }
    });

    return { data: settingsObj };
}

/**
 * Get platform fee rate (public, cached)
 * Used by order completion logic
 */
export async function getPlatformFeeRate(): Promise<number> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'platform_fee_rate')
        .maybeSingle();

    return data ? parseFloat(data.value) : 0.05;
}

// ============================================
// UPDATE SETTINGS
// ============================================

/**
 * Update platform fee rate (Admin only)
 * Only affects FUTURE orders - historical orders unchanged
 */
export async function updatePlatformFeeRate(newRate: number): Promise<SettingsActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Admin access required' };
    }

    // Validate rate (0-100%, stored as decimal)
    if (newRate < 0 || newRate > 1) {
        return { error: 'Fee rate must be between 0 and 1 (0% to 100%)' };
    }

    const { error } = await supabase
        .from('platform_settings')
        .upsert({
            key: 'platform_fee_rate',
            value: newRate.toString(),
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        }, { onConflict: 'key' });

    if (error) {
        console.error('[updatePlatformFeeRate]', error);
        return { error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

/**
 * Update default delivery fee (Admin only)
 */
export async function updateDefaultDeliveryFee(newFee: number): Promise<SettingsActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Admin access required' };
    }

    if (newFee < 0) {
        return { error: 'Delivery fee cannot be negative' };
    }

    const { error } = await supabase
        .from('platform_settings')
        .upsert({
            key: 'default_delivery_fee',
            value: newFee.toString(),
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        }, { onConflict: 'key' });

    if (error) {
        console.error('[updateDefaultDeliveryFee]', error);
        return { error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

// ============================================
// SPONSORED LISTINGS
// ============================================

/**
 * Toggle product sponsored status (Admin only)
 */
export async function toggleProductSponsored(
    productId: string,
    isSponsored: boolean,
    sponsoredUntil?: Date
): Promise<SettingsActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Admin access required' };
    }

    const { error } = await supabase
        .from('products')
        .update({
            is_sponsored: isSponsored,
            sponsored_until: sponsoredUntil?.toISOString() || null,
        })
        .eq('id', productId);

    if (error) {
        console.error('[toggleProductSponsored]', error);
        return { error: error.message };
    }

    revalidatePath('/products');
    revalidatePath('/admin');
    return { success: true };
}

/**
 * Get sponsored products (for display)
 */
export async function getSponsoredProducts(limit: number = 4) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('id, name_en, name_ar, price, images, seller_id')
        .eq('is_sponsored', true)
        .eq('is_active', true)
        .or(`sponsored_until.is.null,sponsored_until.gt.${new Date().toISOString()}`)
        .limit(limit);

    if (error) {
        console.error('[getSponsoredProducts]', error);
        return [];
    }

    return data || [];
}

// ============================================
// REVENUE ANALYTICS
// ============================================

/**
 * Get platform revenue summary (Admin only)
 */
export async function getPlatformRevenue(): Promise<{
    totalRevenue: number;
    totalPlatformFees: number;
    totalSellerPayouts: number;
    ordersCompleted: number;
    avgFeeRate: number;
    todayRevenue: number;
    monthRevenue: number;
} | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all completed orders with monetization data
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, platform_fee, seller_payout, platform_fee_rate, created_at')
        .eq('status', 'delivered')
        .not('platform_fee', 'is', null);

    if (!orders || orders.length === 0) {
        return {
            totalRevenue: 0,
            totalPlatformFees: 0,
            totalSellerPayouts: 0,
            ordersCompleted: 0,
            avgFeeRate: 0.05,
            todayRevenue: 0,
            monthRevenue: 0,
        };
    }

    const stats = orders.reduce((acc, o) => {
        const total = Number(o.total_amount) || 0;
        const fee = Number(o.platform_fee) || 0;
        const payout = Number(o.seller_payout) || 0;
        const rate = Number(o.platform_fee_rate) || 0;
        const createdAt = new Date(o.created_at);

        acc.totalRevenue += total;
        acc.totalPlatformFees += fee;
        acc.totalSellerPayouts += payout;
        acc.rateSum += rate;
        acc.count += 1;

        if (createdAt >= todayStart) {
            acc.todayRevenue += fee;
        }
        if (createdAt >= monthStart) {
            acc.monthRevenue += fee;
        }

        return acc;
    }, {
        totalRevenue: 0,
        totalPlatformFees: 0,
        totalSellerPayouts: 0,
        rateSum: 0,
        count: 0,
        todayRevenue: 0,
        monthRevenue: 0,
    });

    return {
        totalRevenue: stats.totalRevenue,
        totalPlatformFees: stats.totalPlatformFees,
        totalSellerPayouts: stats.totalSellerPayouts,
        ordersCompleted: stats.count,
        avgFeeRate: stats.count > 0 ? stats.rateSum / stats.count : 0.05,
        todayRevenue: stats.todayRevenue,
        monthRevenue: stats.monthRevenue,
    };
}

/**
 * Get seller earnings summary
 */
export async function getSellerEarnings(sellerId?: string): Promise<{
    grossSales: number;
    platformFees: number;
    netEarnings: number;
    pendingPayout: number;
    ordersCount: number;
} | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Use provided sellerId or current user
    const targetSellerId = sellerId || user.id;

    // Verify access (either admin or the seller themselves)
    if (targetSellerId !== user.id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

        if (!profile?.is_admin) return null;
    }

    // Get completed orders for this seller
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, platform_fee, seller_payout')
        .eq('seller_id', targetSellerId)
        .eq('status', 'delivered');

    if (!orders || orders.length === 0) {
        return {
            grossSales: 0,
            platformFees: 0,
            netEarnings: 0,
            pendingPayout: 0,
            ordersCount: 0,
        };
    }

    const stats = orders.reduce((acc, o) => {
        acc.grossSales += Number(o.total_amount) || 0;
        acc.platformFees += Number(o.platform_fee) || 0;
        acc.netEarnings += Number(o.seller_payout) || 0;
        return acc;
    }, { grossSales: 0, platformFees: 0, netEarnings: 0 });

    return {
        ...stats,
        pendingPayout: stats.netEarnings, // TODO: Track actual payouts
        ordersCount: orders.length,
    };
}
