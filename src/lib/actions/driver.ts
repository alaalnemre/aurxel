'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActivationResult = {
    error?: string;
    success?: boolean;
};

// Activate driver capability for current user
export async function activateDriver(
    formData: FormData
): Promise<ActivationResult> {
    const vehicleType = formData.get('vehicleType') as string;
    const vehiclePlate = formData.get('vehiclePlate') as string;

    if (!vehicleType || !vehiclePlate) {
        return { error: 'Vehicle type and plate are required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Check if already a driver
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_driver')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.is_driver) {
        return { error: 'Already registered as a driver' };
    }

    // Update profile capability
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_driver: true })
        .eq('id', user.id);

    if (profileError) {
        return { error: 'Failed to activate driver capability' };
    }

    // Create driver profile
    const { error: driverError } = await supabase
        .from('driver_profiles')
        .insert({
            id: user.id,
            vehicle_type: vehicleType,
            vehicle_plate: vehiclePlate,
            is_active: false, // Needs admin verification
            is_verified: false,
        });

    if (driverError) {
        // Rollback profile update
        await supabase
            .from('profiles')
            .update({ is_driver: false })
            .eq('id', user.id);
        return { error: 'Failed to create driver profile' };
    }

    revalidatePath('/');
    return { success: true };
}

// Update driver availability status
export async function updateDriverStatus(
    isActive: boolean
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify driver is verified before allowing active status
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('is_verified')
        .eq('id', user.id)
        .maybeSingle();

    if (!driverProfile) {
        return { error: 'Driver profile not found' };
    }

    if (isActive && !driverProfile.is_verified) {
        return { error: 'Must be verified to go active' };
    }

    const { error } = await supabase
        .from('driver_profiles')
        .update({ is_active: isActive })
        .eq('id', user.id);

    if (error) {
        return { error: 'Failed to update status' };
    }

    revalidatePath('/');
    return { success: true };
}

// Accept a delivery
export async function acceptDelivery(
    deliveryId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify driver is active
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('is_active, is_verified')
        .eq('id', user.id)
        .maybeSingle();

    if (!driverProfile?.is_active || !driverProfile?.is_verified) {
        return { error: 'Must be active and verified to accept deliveries' };
    }

    // Accept the delivery
    const { error } = await supabase
        .from('deliveries')
        .update({
            driver_id: user.id,
            status: 'assigned',
        })
        .eq('id', deliveryId)
        .eq('status', 'available');

    if (error) {
        return { error: 'Failed to accept delivery' };
    }

    // Update order status
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('order_id')
        .eq('id', deliveryId)
        .maybeSingle();

    if (delivery) {
        await supabase
            .from('orders')
            .update({ status: 'assigned' })
            .eq('id', delivery.order_id);
    }

    revalidatePath('/');
    return { success: true };
}

// Mark delivery as picked up
export async function markPickedUp(
    deliveryId: string
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
        })
        .eq('id', deliveryId)
        .eq('driver_id', user.id)
        .eq('status', 'assigned');

    if (error) {
        return { error: 'Failed to update delivery' };
    }

    // Update order status
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('order_id')
        .eq('id', deliveryId)
        .maybeSingle();

    if (delivery) {
        await supabase
            .from('orders')
            .update({ status: 'picked_up' })
            .eq('id', delivery.order_id);
    }

    revalidatePath('/');
    return { success: true };
}

// Mark delivery as completed
export async function markDelivered(
    deliveryId: string,
    cashCollected: number
): Promise<ActivationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('deliveries')
        .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            cash_collected: cashCollected,
        })
        .eq('id', deliveryId)
        .eq('driver_id', user.id)
        .eq('status', 'picked_up');

    if (error) {
        return { error: 'Failed to complete delivery' };
    }

    // Update order status
    const { data: delivery } = await supabase
        .from('deliveries')
        .select('order_id')
        .eq('id', deliveryId)
        .maybeSingle();

    if (delivery) {
        await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', delivery.order_id);
    }

    revalidatePath('/');
    return { success: true };
}

// Aliases for backward compatibility
export const pickupDelivery = markPickedUp;
export const completeDelivery = markDelivered;
