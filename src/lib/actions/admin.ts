'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type AdminActionResult = {
    error?: string;
    codes?: string[];
    success?: boolean;
};

function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'QANZ-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function generateTopupCodes(
    amount: number,
    count: number
): Promise<AdminActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin capability
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Not authorized' };
    }

    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
        const code = generateCode();
        codes.push(code);

        const { error } = await supabase
            .from('topup_codes')
            .insert({
                code,
                amount,
                created_by: user.id,
            });

        if (error) {
            console.error('[generateTopupCodes]', error);
            return { error: error.message };
        }
    }

    revalidatePath('/admin/qanz');

    return { codes };
}

export async function verifySeller(sellerId: string): Promise<AdminActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin capability
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('seller_profiles')
        .update({ is_verified: true })
        .eq('id', sellerId);

    if (error) {
        console.error('[verifySeller]', error);
        return { error: error.message };
    }

    revalidatePath('/admin/sellers');
    revalidatePath('/admin');

    return { success: true };
}

export async function verifyDriver(driverId: string): Promise<AdminActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify admin capability
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return { error: 'Not authorized' };
    }

    const { error } = await supabase
        .from('driver_profiles')
        .update({ is_verified: true })
        .eq('id', driverId);

    if (error) {
        console.error('[verifyDriver]', error);
        return { error: error.message };
    }

    revalidatePath('/admin/drivers');
    revalidatePath('/admin');

    return { success: true };
}

export async function getAdminStats() {
    const supabase = await createClient();

    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: pendingSellers } = await supabase.from('seller_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false);
    const { count: pendingDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false);

    // Calculate total revenue
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');

    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    return {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        pendingSellers: pendingSellers || 0,
        pendingDrivers: pendingDrivers || 0,
        totalRevenue,
    };
}
