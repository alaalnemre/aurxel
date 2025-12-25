'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import type { DeliveryWithDetails, DeliveryStatus } from '@/lib/types/database';

export interface DeliveryActionResult {
    success: boolean;
    error?: string;
}

/**
 * Get available deliveries for drivers
 */
export async function getAvailableDeliveries(): Promise<DeliveryWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return [];
    }

    const { data, error } = await supabase
        .from('deliveries')
        .select(`
            *,
            order:orders(
                *,
                items:order_items(*),
                seller:profiles!orders_seller_id_fkey(id, full_name),
                buyer:profiles!orders_buyer_id_fkey(id, full_name, phone)
            )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[getAvailableDeliveries] Error:', error);
        return [];
    }

    return (data || []) as DeliveryWithDetails[];
}

/**
 * Get driver's assigned deliveries
 */
export async function getDriverDeliveries(): Promise<DeliveryWithDetails[]> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return [];
    }

    const { data, error } = await supabase
        .from('deliveries')
        .select(`
            *,
            order:orders(
                *,
                items:order_items(*),
                seller:profiles!orders_seller_id_fkey(id, full_name),
                buyer:profiles!orders_buyer_id_fkey(id, full_name, phone)
            )
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getDriverDeliveries] Error:', error);
        return [];
    }

    return (data || []) as DeliveryWithDetails[];
}

/**
 * Get a specific delivery for driver
 */
export async function getDeliveryDetails(deliveryId: string): Promise<DeliveryWithDetails | null> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return null;
    }

    const { data, error } = await supabase
        .from('deliveries')
        .select(`
            *,
            order:orders(
                *,
                items:order_items(*),
                seller:profiles!orders_seller_id_fkey(id, full_name, phone),
                buyer:profiles!orders_buyer_id_fkey(id, full_name, phone)
            )
        `)
        .eq('id', deliveryId)
        .maybeSingle();

    if (error) {
        console.error('[getDeliveryDetails] Error:', error);
        return null;
    }

    // Allow viewing if available or assigned to this driver
    if (data && (data.status === 'available' || data.driver_id === user.id)) {
        return data as DeliveryWithDetails;
    }

    return null;
}

/**
 * Accept an available delivery
 */
export async function acceptDelivery(deliveryId: string): Promise<DeliveryActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return { success: false, error: 'Not authorized' };
    }

    // Get the delivery first
    const { data: delivery, error: fetchError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', deliveryId)
        .eq('status', 'available')
        .maybeSingle();

    if (fetchError || !delivery) {
        return { success: false, error: 'Delivery not available' };
    }

    // Assign to driver
    const { error } = await supabase
        .from('deliveries')
        .update({
            driver_id: user.id,
            status: 'assigned',
        })
        .eq('id', deliveryId)
        .eq('status', 'available'); // Ensure it's still available

    if (error) {
        console.error('[acceptDelivery] Error:', error);
        return { success: false, error: error.message || 'Failed to accept delivery' };
    }

    revalidatePath(`/${locale}/driver/deliveries`);

    return { success: true };
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
    deliveryId: string,
    newStatus: DeliveryStatus
): Promise<DeliveryActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return { success: false, error: 'Not authorized' };
    }

    // Validate allowed transitions
    const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
        available: ['assigned'],
        assigned: ['picked_up'],
        picked_up: ['delivered'],
        delivered: [],
    };

    // Get current status
    const { data: delivery, error: fetchError } = await supabase
        .from('deliveries')
        .select('status')
        .eq('id', deliveryId)
        .eq('driver_id', user.id)
        .maybeSingle();

    if (fetchError || !delivery) {
        return { success: false, error: 'Delivery not found' };
    }

    const currentStatus = delivery.status as DeliveryStatus;
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
        return { success: false, error: `Cannot transition from ${currentStatus} to ${newStatus}` };
    }

    // Update status
    const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId)
        .eq('driver_id', user.id);

    if (error) {
        console.error('[updateDeliveryStatus] Error:', error);
        return { success: false, error: error.message || 'Failed to update status' };
    }

    revalidatePath(`/${locale}/driver/deliveries`);
    revalidatePath(`/${locale}/driver/deliveries/${deliveryId}`);

    return { success: true };
}

/**
 * Get delivery info for an order (for buyer/seller views)
 */
export async function getOrderDelivery(orderId: string): Promise<DeliveryWithDetails | null> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('deliveries')
        .select(`
            *,
            driver:profiles!deliveries_driver_id_fkey(id, full_name, phone)
        `)
        .eq('order_id', orderId)
        .maybeSingle();

    if (error) {
        console.error('[getOrderDelivery] Error:', error);
        return null;
    }

    return data as DeliveryWithDetails | null;
}
