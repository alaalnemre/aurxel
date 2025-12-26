'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type DriverActionResult = {
    error?: string;
    success?: boolean;
};

export async function acceptDelivery(deliveryId: string): Promise<DriverActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Check if delivery is still available
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('status')
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery || delivery.status !== 'available') {
        return { error: 'Delivery is no longer available' };
    }

    // Assign to driver
    const { error } = await supabase
        .from('deliveries')
        .update({
            driver_id: user.id,
            status: 'assigned',
        })
        .eq('id', deliveryId);

    if (error) {
        console.error('[acceptDelivery]', error);
        return { error: error.message };
    }

    revalidatePath('/driver/deliveries');
    revalidatePath('/buyer/orders');

    return { success: true };
}

export async function pickupDelivery(deliveryId: string): Promise<DriverActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify delivery belongs to driver
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('driver_id, order_id')
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery || delivery.driver_id !== user.id) {
        return { error: 'Delivery not found' };
    }

    // Update delivery status
    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'picked_up',
            pickup_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);

    if (error) {
        console.error('[pickupDelivery]', error);
        return { error: error.message };
    }

    // Update order status
    await supabase
        .from('orders')
        .update({ status: 'picked_up' })
        .eq('id', delivery.order_id);

    revalidatePath('/driver/deliveries');
    revalidatePath('/buyer/orders');
    revalidatePath('/seller/orders');

    return { success: true };
}

export async function completeDelivery(
    deliveryId: string,
    cashCollected: number
): Promise<DriverActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify delivery belongs to driver
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('driver_id, order_id')
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery || delivery.driver_id !== user.id) {
        return { error: 'Delivery not found' };
    }

    // Update delivery status
    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            cash_collected: cashCollected,
        })
        .eq('id', deliveryId);

    if (error) {
        console.error('[completeDelivery]', error);
        return { error: error.message };
    }

    // Update order status
    await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', delivery.order_id);

    revalidatePath('/driver/deliveries');
    revalidatePath('/driver/earnings');
    revalidatePath('/buyer/orders');
    revalidatePath('/seller/orders');

    return { success: true };
}

export async function getDriverStats(driverId: string) {
    const supabase = await createClient();

    const { data: completedDeliveries } = await supabase
        .from('deliveries')
        .select('cash_collected, delivered_at')
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

    const totalCash = completedDeliveries?.reduce(
        (sum, d) => sum + (Number(d.cash_collected) || 0),
        0
    ) || 0;

    const totalDeliveries = completedDeliveries?.length || 0;

    return { totalCash, totalDeliveries };
}
