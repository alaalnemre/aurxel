'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const requestPayoutSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    paymentDetails: z.record(z.string()).optional(),
});

// Request a payout (seller only)
export async function requestPayout(formData: FormData): Promise<ActionResult<{ payoutId: string }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const rawData = {
        amount: parseFloat(formData.get('amount') as string),
        paymentMethod: formData.get('paymentMethod') as string,
        paymentDetails: formData.get('paymentDetails')
            ? JSON.parse(formData.get('paymentDetails') as string)
            : undefined,
    };

    const validation = requestPayoutSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    // Get seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    // Calculate available balance (sum of unsettled commissions)
    const { data: commissions } = await supabase
        .from('order_commissions')
        .select('seller_earnings')
        .eq('seller_id', seller.id)
        .eq('is_settled', false);

    const availableBalance = (commissions || []).reduce(
        (sum, c) => sum + Number(c.seller_earnings),
        0
    );

    if (validation.data.amount > availableBalance) {
        return { success: false, error: 'Insufficient balance' };
    }

    // Create payout request
    const { data: payout, error } = await supabase
        .from('payouts')
        .insert({
            seller_id: seller.id,
            amount: validation.data.amount,
            payment_method: validation.data.paymentMethod,
            payment_details: validation.data.paymentDetails || null,
        })
        .select('id')
        .maybeSingle();

    if (error) {
        console.error('[requestPayout] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/seller/finance');
    return { success: true, data: { payoutId: payout?.id || '' } };
}

// Get seller payouts
export async function getSellerPayouts(
    limit: number = 20,
    offset: number = 0
): Promise<ActionResult<{
    payouts: Array<{
        id: string;
        amount: number;
        status: string;
        payment_method: string;
        created_at: string;
        processed_at: string | null;
    }>;
    total: number;
}>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (!seller) {
        return { success: false, error: 'Not a seller' };
    }

    const { data: payouts, error, count } = await supabase
        .from('payouts')
        .select('id, amount, status, payment_method, created_at, processed_at', { count: 'exact' })
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[getSellerPayouts] Error:', error);
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            payouts: payouts || [],
            total: count || 0
        }
    };
}

// Admin: Get all pending payouts
export async function getPendingPayouts(): Promise<ActionResult<{
    payouts: Array<{
        id: string;
        amount: number;
        status: string;
        payment_method: string;
        created_at: string;
        seller: { store_name: string };
    }>;
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

    const { data: payouts, error } = await supabase
        .from('payouts')
        .select(`
            id,
            amount,
            status,
            payment_method,
            created_at,
            sellers!inner(store_name)
        `)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[getPendingPayouts] Error:', error);
        return { success: false, error: error.message };
    }

    // Transform data
    const transformedPayouts = (payouts || []).map(p => {
        const sellerData = p.sellers as unknown as { store_name: string } | null;
        return {
            id: p.id,
            amount: p.amount,
            status: p.status,
            payment_method: p.payment_method,
            created_at: p.created_at,
            seller: { store_name: sellerData?.store_name || '' }
        };
    });

    return { success: true, data: { payouts: transformedPayouts } };
}

// Admin: Process payout
export async function processPayout(
    payoutId: string,
    action: 'complete' | 'fail'
): Promise<ActionResult> {
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

    const newStatus = action === 'complete' ? 'completed' : 'failed';

    const { error } = await supabase
        .from('payouts')
        .update({
            status: newStatus,
            processed_by: user.id,
            processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId);

    if (error) {
        console.error('[processPayout] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/payouts');
    return { success: true };
}
