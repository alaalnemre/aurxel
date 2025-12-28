'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';
// ... (imports)
import { createNotification } from './notifications';
import { evaluateDriverBadges, evaluateBuyerBadges, evaluateSellerBadges } from './badges';

const acceptDeliverySchema = z.object({
    deliveryId: z.string().uuid(),
});

const updateDeliverySchema = z.object({
    deliveryId: z.string().uuid(),
});


// Driver Accept Delivery
export async function driverAcceptDelivery(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        deliveryId: formData.get('deliveryId') as string,
    };

    const validation = acceptDeliverySchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { deliveryId } = validation.data;

    // Get driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

    if (!driver) {
        return { success: false, error: 'Not an approved driver' };
    }

    // Get delivery
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('id, status, order_id, orders(buyer_profile_id)')
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery) {
        return { success: false, error: 'Delivery not found' };
    }

    if (delivery.status !== 'available') {
        return { success: false, error: 'Delivery is not available' };
    }

    // Update delivery
    const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({
            driver_id: driver.id,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);

    if (deliveryError) {
        console.error('[driverAcceptDelivery] Error updating delivery:', deliveryError);
        return { success: false, error: deliveryError.message };
    }

    // Update order status
    const { error: orderError } = await supabase
        .from('orders')
        .update({
            status: 'assigned',
        })
        .eq('id', delivery.order_id);

    if (orderError) {
        console.error('[driverAcceptDelivery] Error updating order:', orderError);
    }

    // Notify Buyer
    const orderInfo = delivery.orders as unknown as { buyer_profile_id: string } | null;
    if (orderInfo?.buyer_profile_id) {
        await createNotification(
            orderInfo.buyer_profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.assigned',
            { orderId: delivery.order_id },
            `order_status:${delivery.order_id}:assigned`
        );
    }

    return { success: true };
}

// Driver Mark Picked Up
export async function driverMarkPickedUp(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        deliveryId: formData.get('deliveryId') as string,
    };

    const validation = updateDeliverySchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { deliveryId } = validation.data;

    // Get driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (!driver) {
        return { success: false, error: 'Not a driver' };
    }

    // Get delivery
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('id, status, order_id, driver_id, orders(buyer_profile_id)')
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery || delivery.driver_id !== driver.id) {
        return { success: false, error: 'Delivery not found' };
    }

    if (delivery.status !== 'assigned') {
        return { success: false, error: 'Cannot mark as picked up in current status' };
    }

    // Update delivery
    const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);

    if (deliveryError) {
        console.error('[driverMarkPickedUp] Error updating delivery:', deliveryError);
        return { success: false, error: deliveryError.message };
    }

    // Update order status
    const { error: orderError } = await supabase
        .from('orders')
        .update({
            status: 'picked_up',
        })
        .eq('id', delivery.order_id);

    if (orderError) {
        console.error('[driverMarkPickedUp] Error updating order:', orderError);
    }

    // Notify Buyer
    const orderInfo = delivery.orders as unknown as { buyer_profile_id: string } | null;
    if (orderInfo?.buyer_profile_id) {
        await createNotification(
            orderInfo.buyer_profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.picked_up',
            { orderId: delivery.order_id },
            `order_status:${delivery.order_id}:picked_up`
        );
    }

    return { success: true };
}

// Driver Mark Delivered
export async function driverMarkDelivered(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        deliveryId: formData.get('deliveryId') as string,
    };

    const validation = updateDeliverySchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { deliveryId } = validation.data;

    // Get driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

    if (!driver) {
        return { success: false, error: 'Not a driver' };
    }

    // Get delivery and related order details
    // We need seller profile ID too, so we need to join sellers
    const { data: delivery } = await supabase
        .from('deliveries')
        .select(`
            id, status, order_id, driver_id, driver_profile_id, 
            orders(
                buyer_profile_id, 
                seller_id,
                sellers(profile_id)
            )
        `)
        .eq('id', deliveryId)
        .maybeSingle();

    if (!delivery || delivery.driver_id !== driver.id) {
        return { success: false, error: 'Delivery not found' };
    }

    if (delivery.status !== 'picked_up') {
        return { success: false, error: 'Cannot mark as delivered in current status' };
    }

    // Update delivery
    const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);

    if (deliveryError) {
        console.error('[driverMarkDelivered] Error updating delivery:', deliveryError);
        return { success: false, error: deliveryError.message };
    }

    // Update order status to completed
    const { error: orderError } = await supabase
        .from('orders')
        .update({
            status: 'completed',
            delivered_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
        })
        .eq('id', delivery.order_id);

    if (orderError) {
        console.error('[driverMarkDelivered] Error updating order:', orderError);
    }

    // Handle notifications and badges
    try {
        const orderInfo = delivery.orders as any;
        const buyerId = orderInfo?.buyer_profile_id;
        const sellerId = orderInfo?.seller_id;
        const sellerProfileId = orderInfo?.sellers?.profile_id;

        // Notify Buyer: Delivered
        if (buyerId) {
            await createNotification(
                buyerId,
                'order_status',
                'notifications.orderStatus.title',
                'notifications.orderStatus.delivered',
                { orderId: delivery.order_id },
                `order_status:${delivery.order_id}:delivered`
            );
        }

        // Notify Seller: Delivered
        if (sellerProfileId) {
            await createNotification(
                sellerProfileId,
                'order_status',
                'notifications.orderStatus.title',
                'notifications.orderStatus.delivered',
                { orderId: delivery.order_id },
                `order_status:${delivery.order_id}:delivered_seller`
            );
        }

        // Trigger Badge Evaluations

        // 1. Driver badges
        if (delivery.driver_profile_id) {
            await evaluateDriverBadges(delivery.driver_profile_id);
        }

        // 2. Buyer badges
        if (buyerId) {
            await evaluateBuyerBadges(buyerId);
        }

        // 3. Seller badges
        if (sellerId) {
            await evaluateSellerBadges(sellerId);
        }
    } catch (error) {
        console.error('[driverMarkDelivered] Error in post-delivery tasks:', error);
        // Don't fail main action
    }

    return { success: true };
}
