'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get wallet for current user
export async function getWallet(): Promise<ActionResult<{
    id: string;
    balance_jod: number;
    coins: number;
}>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: wallet, error } = await supabase
        .from('wallets')
        .select('id, balance_jod, coins')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getWallet] Error:', error);
        return { success: false, error: error.message };
    }

    // Return default wallet if none exists (will be created by trigger)
    return {
        success: true,
        data: wallet || { id: '', balance_jod: 0, coins: 0 }
    };
}

// Get wallet transactions for current user
export async function getWalletTransactions(
    limit: number = 20,
    offset: number = 0
): Promise<ActionResult<{
    transactions: Array<{
        id: string;
        type: string;
        amount: number;
        balance_after: number;
        description: string | null;
        created_at: string;
    }>;
    total: number;
}>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get wallet first
    const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (!wallet) {
        return { success: true, data: { transactions: [], total: 0 } };
    }

    // Get transactions
    const { data: transactions, error, count } = await supabase
        .from('wallet_transactions')
        .select('id, type, amount, balance_after, description, created_at', { count: 'exact' })
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[getWalletTransactions] Error:', error);
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            transactions: transactions || [],
            total: count || 0
        }
    };
}

// Admin: Get all wallets with profile info
export async function getAllWallets(
    limit: number = 20,
    offset: number = 0
): Promise<ActionResult<{
    wallets: Array<{
        id: string;
        profile_id: string;
        balance_jod: number;
        coins: number;
        profile: { full_name: string | null };
    }>;
    total: number;
}>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data: wallets, error, count } = await supabase
        .from('wallets')
        .select(`
            id,
            profile_id,
            balance_jod,
            coins,
            profiles!inner(full_name)
        `, { count: 'exact' })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[getAllWallets] Error:', error);
        return { success: false, error: error.message };
    }

    // Transform the data to match expected type
    const transformedWallets = (wallets || []).map(w => {
        const profileData = w.profiles as unknown as { full_name: string | null } | null;
        return {
            id: w.id,
            profile_id: w.profile_id,
            balance_jod: w.balance_jod,
            coins: w.coins,
            profile: { full_name: profileData?.full_name || null }
        };
    });

    return {
        success: true,
        data: {
            wallets: transformedWallets,
            total: count || 0
        }
    };
}
