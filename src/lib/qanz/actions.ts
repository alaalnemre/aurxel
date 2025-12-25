'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import { applyRateLimit, isRateLimitError, getRateLimitMessage } from '@/lib/security/rate-limit';
import type { QanzLedgerEntry, QanzTopupCodeWithDetails } from '@/lib/types/database';

export interface QanzActionResult {
    success: boolean;
    error?: string;
    balance?: number;
}

/**
 * Get user's QANZ balance
 */
export async function getQanzBalance(): Promise<number> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return 0;
    }

    const { data, error } = await supabase.rpc('get_qanz_balance', {
        p_user_id: user.id,
    });

    if (error) {
        console.error('[getQanzBalance] Error:', error);
        // Fallback to direct query
        const { data: ledgerSum } = await supabase
            .from('qanz_ledger')
            .select('amount')
            .eq('user_id', user.id);

        if (ledgerSum) {
            return ledgerSum.reduce((sum, entry) => sum + Number(entry.amount), 0);
        }
        return 0;
    }

    return Number(data) || 0;
}

/**
 * Get user's ledger history
 */
export async function getLedgerHistory(): Promise<QanzLedgerEntry[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('qanz_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getLedgerHistory] Error:', error);
        return [];
    }

    return (data || []) as QanzLedgerEntry[];
}

/**
 * Redeem a top-up code (via RPC for atomicity)
 */
export async function redeemCode(code: string): Promise<QanzActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user } = await getProfile();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Rate limiting
    try {
        applyRateLimit('QANZ_REDEEM', user.id);
    } catch (error) {
        if (isRateLimitError(error)) {
            return { success: false, error: getRateLimitMessage(locale) };
        }
        throw error;
    }

    // Clean up code (remove spaces, dashes, uppercase)
    const cleanCode = code.replace(/[\s-]/g, '').toUpperCase();
    // Format as XXXX-XXXX-XXXX
    const formattedCode = cleanCode.match(/.{1,4}/g)?.join('-') || cleanCode;

    const { data, error } = await supabase.rpc('redeem_qanz_code', {
        p_code: formattedCode,
    });

    if (error) {
        console.error('[redeemCode] Error:', error);
        return { success: false, error: error.message || 'Failed to redeem code' };
    }

    // RPC returns array with one row
    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.success) {
        return { success: false, error: result?.message || 'Failed to redeem code' };
    }

    revalidatePath(`/${locale}/wallet`);

    return {
        success: true,
        balance: Number(result.new_balance),
    };
}

/**
 * Generate top-up codes (admin only)
 */
export async function generateCodes(
    amount: number,
    quantity: number
): Promise<{ success: boolean; error?: string; codes?: string[] }> {
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

    if (amount <= 0 || quantity <= 0 || quantity > 100) {
        return { success: false, error: 'Invalid amount or quantity' };
    }

    const generatedCodes: string[] = [];

    for (let i = 0; i < quantity; i++) {
        // Generate code client-side (or use RPC)
        const code = generateRandomCode();

        const { error } = await supabase.from('qanz_topup_codes').insert({
            code,
            amount,
            status: 'active',
            created_by: user.id,
        });

        if (error) {
            console.error('[generateCodes] Error:', error);
            // Continue with other codes if one fails
        } else {
            generatedCodes.push(code);
        }
    }

    revalidatePath(`/${locale}/admin/qanz`);
    revalidatePath(`/${locale}/admin/qanz/codes`);

    return { success: true, codes: generatedCodes };
}

/**
 * Generate a random code in format XXXX-XXXX-XXXX
 */
function generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';

    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7) {
            result += '-';
        }
    }

    return result;
}

/**
 * Get all top-up codes (admin only)
 */
export async function getAllCodes(
    status?: 'active' | 'redeemed' | 'voided'
): Promise<QanzTopupCodeWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return [];
    }

    let query = supabase
        .from('qanz_topup_codes')
        .select(`
            *,
            creator:profiles!qanz_topup_codes_created_by_fkey(id, full_name),
            redeemer:profiles!qanz_topup_codes_redeemed_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[getAllCodes] Error:', error);
        return [];
    }

    return (data || []) as QanzTopupCodeWithDetails[];
}

/**
 * Void a top-up code (admin only)
 */
export async function voidCode(codeId: string): Promise<QanzActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('qanz_topup_codes')
        .update({ status: 'voided' })
        .eq('id', codeId)
        .eq('status', 'active');

    if (error) {
        console.error('[voidCode] Error:', error);
        return { success: false, error: error.message || 'Failed to void code' };
    }

    revalidatePath(`/${locale}/admin/qanz`);
    revalidatePath(`/${locale}/admin/qanz/codes`);

    return { success: true };
}

/**
 * Get outstanding liability (sum of active code amounts)
 */
export async function getOutstandingLiability(): Promise<number> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return 0;
    }

    const { data, error } = await supabase
        .from('qanz_topup_codes')
        .select('amount')
        .eq('status', 'active');

    if (error) {
        console.error('[getOutstandingLiability] Error:', error);
        return 0;
    }

    return (data || []).reduce((sum, code) => sum + Number(code.amount), 0);
}

/**
 * Get QANZ stats (admin only)
 */
export async function getQanzStats() {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'admin') {
        return null;
    }

    const [codesResult, ledgerResult] = await Promise.all([
        supabase.from('qanz_topup_codes').select('amount, status'),
        supabase.from('qanz_ledger').select('amount, type'),
    ]);

    if (codesResult.error || ledgerResult.error) {
        return null;
    }

    const codes = codesResult.data || [];
    const ledger = ledgerResult.data || [];

    return {
        totalCodesGenerated: codes.length,
        activeCodes: codes.filter((c) => c.status === 'active').length,
        redeemedCodes: codes.filter((c) => c.status === 'redeemed').length,
        voidedCodes: codes.filter((c) => c.status === 'voided').length,
        outstandingLiability: codes
            .filter((c) => c.status === 'active')
            .reduce((sum, c) => sum + Number(c.amount), 0),
        totalRedeemed: codes
            .filter((c) => c.status === 'redeemed')
            .reduce((sum, c) => sum + Number(c.amount), 0),
        totalInCirculation: ledger.reduce((sum, e) => sum + Number(e.amount), 0),
        totalTopups: ledger
            .filter((e) => e.type === 'topup')
            .reduce((sum, e) => sum + Number(e.amount), 0),
        totalSpent: Math.abs(
            ledger
                .filter((e) => e.type === 'spend')
                .reduce((sum, e) => sum + Number(e.amount), 0)
        ),
    };
}
