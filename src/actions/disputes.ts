'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

const openDisputeSchema = z.object({
    orderId: z.string().uuid(),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export async function openDispute(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const rawData = {
        orderId: formData.get('orderId') as string,
        reason: formData.get('reason') as string,
    };

    const validation = openDisputeSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: validation.error.errors[0].message };

    const { orderId, reason } = validation.data;

    // Verify user owns the order
    const { data: order } = await supabase.from('orders').select('id, buyer_profile_id').eq('id', orderId).maybeSingle();
    if (!order || order.buyer_profile_id !== user.id) return { success: false, error: 'Order not found' };

    // Check if dispute already exists
    const { data: existing } = await supabase.from('disputes').select('id').eq('order_id', orderId).maybeSingle();
    if (existing) return { success: false, error: 'Dispute already exists for this order' };

    const { error } = await supabase.from('disputes').insert({ order_id: orderId, opened_by: user.id, reason });
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function adminUpdateDisputeStatus(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (!profile?.is_admin) return { success: false, error: 'Unauthorized' };

    const disputeId = formData.get('disputeId') as string;
    const status = formData.get('status') as 'investigating' | 'resolved' | 'rejected';
    const resolution = formData.get('resolution') as string || undefined;

    const { error } = await supabase.from('disputes').update({ status, resolution }).eq('id', disputeId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}
