'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
    success: boolean;
    error?: string;
    data?: unknown;
};

// ============================================
// Approval Actions
// ============================================

export async function approveSeller(sellerId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('sellers')
        .update({ status: 'approved' })
        .eq('id', sellerId)
        .eq('status', 'pending');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/approvals');
    return { success: true };
}

export async function rejectSeller(sellerId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('sellers')
        .update({ status: 'rejected' })
        .eq('id', sellerId)
        .eq('status', 'pending');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/approvals');
    return { success: true };
}

export async function approveDriver(driverId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('drivers')
        .update({ status: 'approved' })
        .eq('id', driverId)
        .eq('status', 'pending');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/approvals');
    return { success: true };
}

export async function rejectDriver(driverId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('drivers')
        .update({ status: 'rejected' })
        .eq('id', driverId)
        .eq('status', 'pending');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/approvals');
    return { success: true };
}

// ============================================
// Top-up Code Actions
// ============================================

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function generateTopupCode(amount: number): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    if (amount <= 0) {
        return { success: false, error: 'Amount must be positive' };
    }

    const code = generateCode();

    const { data, error } = await supabase
        .from('topup_codes')
        .insert({
            code,
            amount,
            status: 'active',
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/topup');
    return { success: true, data };
}

export async function revokeTopupCode(codeId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('topup_codes')
        .update({ status: 'revoked' })
        .eq('id', codeId)
        .eq('status', 'active');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/topup');
    return { success: true };
}
