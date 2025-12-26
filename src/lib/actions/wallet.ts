'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type WalletActionResult = {
    error?: string;
    amount?: number;
};

export async function redeemTopupCode(walletId: string, code: string): Promise<WalletActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Find the code
    const { data: topupCode } = await supabase
        .from('topup_codes')
        .select('*')
        .eq('code', code)
        .is('redeemed_by', null)
        .maybeSingle();

    if (!topupCode) {
        return { error: 'Invalid or already used code' };
    }

    // Mark code as redeemed
    const { error: redeemError } = await supabase
        .from('topup_codes')
        .update({
            redeemed_by: user.id,
            redeemed_at: new Date().toISOString(),
        })
        .eq('id', topupCode.id);

    if (redeemError) {
        console.error('[redeemTopupCode]', redeemError);
        return { error: 'Failed to redeem code' };
    }

    // Get current balance
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .maybeSingle();

    // Update wallet balance
    const newBalance = (wallet?.balance || 0) + topupCode.amount;
    const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId);

    if (updateError) {
        console.error('[redeemTopupCode update]', updateError);
        return { error: 'Failed to update balance' };
    }

    // Create transaction record
    await supabase.from('wallet_transactions').insert({
        wallet_id: walletId,
        type: 'topup',
        amount: topupCode.amount,
        reference_id: topupCode.id,
        description: `Top-up code: ${code}`,
    });

    revalidatePath('/buyer/wallet');

    return { amount: topupCode.amount };
}

export async function getWalletBalance(userId: string): Promise<number> {
    const supabase = await createClient();

    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

    return wallet?.balance || 0;
}
