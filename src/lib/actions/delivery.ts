'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Update delivery status (driver actions)
 */
export async function updateDeliveryStatus(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile.role !== 'driver') {
        throw new Error('Unauthorized: Only drivers can update delivery status');
    }

    const deliveryId = formData.get('deliveryId') as string;
    const newStatus = formData.get('status') as string;

    if (!deliveryId || !newStatus) {
        throw new Error('Delivery ID and status are required');
    }

    const updateData: any = { status: newStatus };

    // Update timestamp based on status
    switch (newStatus) {
        case 'picked_up':
            updateData.picked_up_at = new Date().toISOString();
            break;
        case 'in_transit':
            updateData.in_transit_at = new Date().toISOString();
            break;
        case 'delivered':
            updateData.delivered_at = new Date().toISOString();
            break;
        case 'failed':
            updateData.failed_at = new Date().toISOString();
            break;
    }

    const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId)
        .eq('driver_id', user.id); // Ensure driver owns this delivery

    if (error) {
        console.error('[Delivery] Update status error:', error.message);
        throw new Error(error.message);
    }

    // Also update order status if delivered
    if (newStatus === 'delivered') {
        const { data: delivery } = await supabase
            .from('deliveries')
            .select('order_id')
            .eq('id', deliveryId)
            .single();

        if (delivery) {
            await supabase
                .from('orders')
                .update({
                    status: 'delivered',
                    delivered_at: new Date().toISOString(),
                })
                .eq('id', delivery.order_id);
        }
    }

    revalidatePath('/[locale]/driver/deliveries', 'page');
    revalidatePath('/[locale]/driver', 'page');
}

/**
 * Assign delivery to driver (admin action)
 */
export async function assignDelivery(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can assign deliveries');
    }

    const deliveryId = formData.get('deliveryId') as string;
    const driverId = formData.get('driverId') as string;

    if (!deliveryId || !driverId) {
        throw new Error('Delivery ID and driver ID are required');
    }

    const { error } = await supabase
        .from('deliveries')
        .update({
            driver_id: driverId,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);

    if (error) {
        console.error('[Delivery] Assign delivery error:', error.message);
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/admin/drivers', 'page');
}

/**
 * Record COD settlement (admin action)
 */
export async function recordCODSettlement(formData: FormData) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can record COD settlements');
    }

    const driverId = formData.get('driverId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const notes = formData.get('notes') as string;

    if (!driverId || !amount) {
        throw new Error('Driver ID and amount are required');
    }

    // In a real app, create a settlement record in a settlements table
    // For now, we'll just log it
    console.log('[COD Settlement]', { driverId, amount, notes, settledBy: user.id });

    revalidatePath('/[locale]/admin/cod-settlements', 'page');
}

/**
 * Get COD balance for driver
 */
export async function getDriverCODBalance(driverId: string): Promise<number> {
    const supabase = await createClient();

    // Get all delivered COD orders for this driver
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select(`
      id,
      order:orders (
        total,
        payment_method
      )
    `)
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

    // Calculate total COD amount collected
    const codTotal = deliveries?.reduce((sum, delivery: any) => {
        if (delivery.order?.payment_method === 'cod') {
            return sum + Number(delivery.order.total);
        }
        return sum;
    }, 0) || 0;

    // In a real app, subtract any settled amounts from a settlements table
    // For now, just return the total
    return codTotal;
}
