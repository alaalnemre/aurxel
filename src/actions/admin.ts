'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    return Boolean(profile?.is_admin);
}

export async function adminApproveSeller(formData: FormData): Promise<ActionResult> {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };
    const supabase = await createClient();
    const sellerId = formData.get('sellerId') as string;

    const { data: seller } = await supabase.from('sellers').select('id, profile_id').eq('id', sellerId).maybeSingle();
    if (!seller) return { success: false, error: 'Seller not found' };

    await supabase.from('sellers').update({ status: 'approved' }).eq('id', sellerId);
    await supabase.from('profiles').update({ seller_verified: true }).eq('id', seller.profile_id);
    return { success: true };
}

export async function adminRejectSeller(formData: FormData): Promise<ActionResult> {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };
    const supabase = await createClient();
    const sellerId = formData.get('sellerId') as string;
    const reason = formData.get('reason') as string || 'Rejected by admin';

    await supabase.from('sellers').update({ status: 'rejected', rejection_reason: reason }).eq('id', sellerId);
    return { success: true };
}

export async function adminApproveDriver(formData: FormData): Promise<ActionResult> {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };
    const supabase = await createClient();
    const driverId = formData.get('driverId') as string;

    const { data: driver } = await supabase.from('drivers').select('id, profile_id').eq('id', driverId).maybeSingle();
    if (!driver) return { success: false, error: 'Driver not found' };

    await supabase.from('drivers').update({ status: 'approved' }).eq('id', driverId);
    await supabase.from('profiles').update({ driver_verified: true }).eq('id', driver.profile_id);
    return { success: true };
}

export async function adminRejectDriver(formData: FormData): Promise<ActionResult> {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };
    const supabase = await createClient();
    const driverId = formData.get('driverId') as string;
    const reason = formData.get('reason') as string || 'Rejected by admin';

    await supabase.from('drivers').update({ status: 'rejected', rejection_reason: reason }).eq('id', driverId);
    return { success: true };
}
