'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
    success: boolean;
    error?: string;
    data?: unknown;
};

// ============================================
// Wallet Actions
// ============================================

export async function redeemTopupCode(code: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    if (!code || code.trim() === '') {
        return { success: false, error: 'Code is required' };
    }

    // Get wallet
    const { data: wallet } = await supabase
        .from('wallet_accounts')
        .select('id, balance')
        .eq('owner_id', user.id)
        .single();

    if (!wallet) {
        return { success: false, error: 'Wallet not found' };
    }

    // Find and validate code
    const { data: topupCode } = await supabase
        .from('topup_codes')
        .select('id, amount, status')
        .eq('code', code.toUpperCase().trim())
        .single();

    if (!topupCode) {
        return { success: false, error: 'Invalid code' };
    }

    if (topupCode.status !== 'active') {
        return { success: false, error: 'Code already used or revoked' };
    }

    // Update code status
    const { error: codeError } = await supabase
        .from('topup_codes')
        .update({
            status: 'redeemed',
            redeemed_by: user.id,
            redeemed_at: new Date().toISOString(),
        })
        .eq('id', topupCode.id)
        .eq('status', 'active');

    if (codeError) {
        return { success: false, error: codeError.message };
    }

    // Create transaction
    const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
            account_id: wallet.id,
            type: 'topup',
            amount: topupCode.amount,
            description: `Top-up code: ${code}`,
            related_id: topupCode.id,
        });

    if (txError) {
        // Rollback code status
        await supabase
            .from('topup_codes')
            .update({ status: 'active', redeemed_by: null, redeemed_at: null })
            .eq('id', topupCode.id);
        return { success: false, error: txError.message };
    }

    // Update wallet balance
    const newBalance = Number(wallet.balance) + Number(topupCode.amount);
    const { error: walletError } = await supabase
        .from('wallet_accounts')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

    if (walletError) {
        return { success: false, error: walletError.message };
    }

    revalidatePath('/buyer/wallet');
    return { success: true, data: { amount: topupCode.amount, newBalance } };
}

// ============================================
// Cart Actions
// ============================================

export async function addToCart(productId: string, qty: number = 1): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get or create cart
    let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('buyer_id', user.id)
        .single();

    if (!cart) {
        const { data: newCart, error: cartError } = await supabase
            .from('carts')
            .insert({ buyer_id: user.id })
            .select()
            .single();

        if (cartError || !newCart) {
            return { success: false, error: cartError?.message || 'Failed to create cart' };
        }
        cart = newCart;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, qty')
        .eq('cart_id', cart!.id)
        .eq('product_id', productId)
        .single();

    if (existingItem) {
        // Update quantity
        const { error } = await supabase
            .from('cart_items')
            .update({ qty: existingItem.qty + qty })
            .eq('id', existingItem.id);

        if (error) {
            return { success: false, error: error.message };
        }
    } else {
        // Add new item
        const { error } = await supabase
            .from('cart_items')
            .insert({ cart_id: cart!.id, product_id: productId, qty });

        if (error) {
            return { success: false, error: error.message };
        }
    }

    revalidatePath('/buyer/shop');
    return { success: true };
}

export async function removeFromCart(itemId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/buyer/shop');
    return { success: true };
}

export async function updateCartItemQty(itemId: string, qty: number): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    if (qty <= 0) {
        return removeFromCart(itemId);
    }

    const { error } = await supabase
        .from('cart_items')
        .update({ qty })
        .eq('id', itemId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/buyer/shop');
    return { success: true };
}
