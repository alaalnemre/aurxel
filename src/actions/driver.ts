'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
    success: boolean;
    error?: string;
    data?: unknown;
};

// ============================================
// Delivery Actions
// ============================================

export async function acceptDelivery(deliveryId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('id, status')
        .eq('user_id', user.id)
        .single();

    if (!driver || driver.status !== 'approved') {
        return { success: false, error: 'Not an approved driver' };
    }

    // Update delivery status
    const { error } = await supabase
        .from('deliveries')
        .update({
            driver_id: driver.id,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
        })
        .eq('id', deliveryId)
        .eq('status', 'available');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/driver/deliveries');
    return { success: true };
}

export async function markPickedUp(deliveryId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!driver) {
        return { success: false, error: 'Not a driver' };
    }

    // Verify ownership
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('driver_id')
        .eq('id', deliveryId)
        .single();

    if (delivery?.driver_id !== driver.id) {
        return { success: false, error: 'Not assigned to you' };
    }

    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
        })
        .eq('id', deliveryId)
        .eq('status', 'assigned');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/driver/deliveries');
    return { success: true };
}

export async function markDelivered(deliveryId: string): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!driver) {
        return { success: false, error: 'Not a driver' };
    }

    const { data: delivery } = await supabase
        .from('deliveries')
        .select('driver_id')
        .eq('id', deliveryId)
        .single();

    if (delivery?.driver_id !== driver.id) {
        return { success: false, error: 'Not assigned to you' };
    }

    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
        })
        .eq('id', deliveryId)
        .eq('status', 'picked_up');

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/driver/deliveries');
    revalidatePath('/driver/earnings');
    return { success: true };
}
