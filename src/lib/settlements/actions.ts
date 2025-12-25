'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import type { SettlementWithDetails, SettlementStatus } from '@/lib/types/database';

export interface SettlementActionResult {
    success: boolean;
    error?: string;
}

/**
 * Get seller's settlements (earnings)
 */
export async function getSellerSettlements(): Promise<SettlementWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'seller') {
        return [];
    }

    const { data, error } = await supabase
        .from('settlements')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                created_at,
                buyer:profiles!orders_buyer_id_fkey(id, full_name)
            ),
            driver:profiles!settlements_driver_id_fkey(id, full_name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getSellerSettlements] Error:', error);
        return [];
    }

    return (data || []) as SettlementWithDetails[];
}

/**
 * Get driver's settlements (fees)
 */
export async function getDriverSettlements(): Promise<SettlementWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return [];
    }

    const { data, error } = await supabase
        .from('settlements')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                created_at,
                seller:profiles!orders_seller_id_fkey(id, full_name)
            )
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getDriverSettlements] Error:', error);
        return [];
    }

    return (data || []) as SettlementWithDetails[];
}

/**
 * Get all settlements (for admin)
 */
export async function getAllSettlements(): Promise<SettlementWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('settlements')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                created_at
            ),
            seller:profiles!settlements_seller_id_fkey(id, full_name),
            driver:profiles!settlements_driver_id_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAllSettlements] Error:', error);
        return [];
    }

    return (data || []) as SettlementWithDetails[];
}

/**
 * Get settlement statistics (for admin)
 */
export async function getSettlementStats() {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return null;
    }

    const { data, error } = await supabase
        .from('settlements')
        .select('order_amount, platform_fee, driver_fee, seller_amount, status');

    if (error) {
        console.error('[getSettlementStats] Error:', error);
        return null;
    }

    const stats = {
        totalOrders: data.length,
        totalRevenue: data.reduce((sum, s) => sum + Number(s.order_amount), 0),
        totalPlatformFees: data.reduce((sum, s) => sum + Number(s.platform_fee), 0),
        totalDriverFees: data.reduce((sum, s) => sum + Number(s.driver_fee), 0),
        totalSellerEarnings: data.reduce((sum, s) => sum + Number(s.seller_amount), 0),
        pendingCount: data.filter((s) => s.status === 'pending').length,
        paidCount: data.filter((s) => s.status === 'paid').length,
    };

    return stats;
}

/**
 * Mark settlement as paid (admin)
 */
export async function markSettlementPaid(settlementId: string): Promise<SettlementActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('settlements')
        .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
        })
        .eq('id', settlementId)
        .eq('status', 'pending');

    if (error) {
        console.error('[markSettlementPaid] Error:', error);
        return { success: false, error: error.message || 'Failed to update' };
    }

    revalidatePath(`/${locale}/admin/settlements`);

    return { success: true };
}

/**
 * Get seller earnings summary
 */
export async function getSellerEarningsSummary() {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'seller') {
        return null;
    }

    const { data, error } = await supabase
        .from('settlements')
        .select('order_amount, platform_fee, driver_fee, seller_amount, status')
        .eq('seller_id', user.id);

    if (error) {
        console.error('[getSellerEarningsSummary] Error:', error);
        return null;
    }

    const summary = {
        totalOrders: data.length,
        totalRevenue: data.reduce((sum, s) => sum + Number(s.order_amount), 0),
        totalFees: data.reduce((sum, s) => sum + Number(s.platform_fee) + Number(s.driver_fee), 0),
        totalEarnings: data.reduce((sum, s) => sum + Number(s.seller_amount), 0),
        pendingAmount: data
            .filter((s) => s.status === 'pending')
            .reduce((sum, s) => sum + Number(s.seller_amount), 0),
        paidAmount: data
            .filter((s) => s.status === 'paid')
            .reduce((sum, s) => sum + Number(s.seller_amount), 0),
    };

    return summary;
}
