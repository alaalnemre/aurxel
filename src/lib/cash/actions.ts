'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import { applyRateLimit, isRateLimitError, getRateLimitMessage } from '@/lib/security/rate-limit';
import type { CashCollectionWithDetails, CashCollectionStatus } from '@/lib/types/database';

export interface CashActionResult {
    success: boolean;
    error?: string;
}

/**
 * Get driver's cash collections
 */
export async function getDriverCashCollections(): Promise<CashCollectionWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return [];
    }

    const { data, error } = await supabase
        .from('cash_collections')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                delivery_address,
                seller:profiles!orders_seller_id_fkey(id, full_name),
                buyer:profiles!orders_buyer_id_fkey(id, full_name)
            )
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getDriverCashCollections] Error:', error);
        return [];
    }

    return (data || []) as CashCollectionWithDetails[];
}

/**
 * Get pending cash collections (for admin)
 */
export async function getPendingCashCollections(): Promise<CashCollectionWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('cash_collections')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                delivery_address,
                seller:profiles!orders_seller_id_fkey(id, full_name),
                buyer:profiles!orders_buyer_id_fkey(id, full_name)
            ),
            driver:profiles!cash_collections_driver_id_fkey(id, full_name, phone)
        `)
        .in('status', ['pending', 'collected'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[getPendingCashCollections] Error:', error);
        return [];
    }

    return (data || []) as CashCollectionWithDetails[];
}

/**
 * Get all cash collections (for admin)
 */
export async function getAllCashCollections(): Promise<CashCollectionWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('cash_collections')
        .select(`
            *,
            order:orders(
                id,
                total_amount,
                delivery_address,
                seller:profiles!orders_seller_id_fkey(id, full_name),
                buyer:profiles!orders_buyer_id_fkey(id, full_name)
            ),
            driver:profiles!cash_collections_driver_id_fkey(id, full_name, phone)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAllCashCollections] Error:', error);
        return [];
    }

    return (data || []) as CashCollectionWithDetails[];
}

/**
 * Driver marks cash as collected
 */
export async function markCashCollected(
    collectionId: string,
    amountCollected: number
): Promise<CashActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return { success: false, error: 'Not authorized' };
    }

    // Validate amount
    if (amountCollected < 0) {
        return { success: false, error: 'Invalid amount' };
    }

    // Update collection
    const { error } = await supabase
        .from('cash_collections')
        .update({
            status: 'collected',
            amount_collected: amountCollected,
            collected_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .eq('driver_id', user.id)
        .eq('status', 'pending');

    if (error) {
        console.error('[markCashCollected] Error:', error);
        return { success: false, error: error.message || 'Failed to update' };
    }

    revalidatePath(`/${locale}/driver/cash`);

    return { success: true };
}

/**
 * Admin confirms cash receipt
 */
export async function confirmCashReceipt(collectionId: string): Promise<CashActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    // Rate limiting for admin actions
    try {
        applyRateLimit('ADMIN_ACTION', user.id);
    } catch (error) {
        if (isRateLimitError(error)) {
            return { success: false, error: getRateLimitMessage(locale) };
        }
        throw error;
    }

    // Update collection to confirmed
    const { error } = await supabase
        .from('cash_collections')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: user.id,
        })
        .eq('id', collectionId)
        .eq('status', 'collected');

    if (error) {
        console.error('[confirmCashReceipt] Error:', error);
        return { success: false, error: error.message || 'Failed to confirm' };
    }

    revalidatePath(`/${locale}/admin/cash`);
    revalidatePath(`/${locale}/admin/settlements`);

    return { success: true };
}

