'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

// Validation Schemas
const updateProfileSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
});

const sellerRequestSchema = z.object({
    storeName: z.string().min(2, 'Store name must be at least 2 characters'),
    description: z.string().optional(),
    storeAddress: z.string().min(5, 'Store address is required'),
    storeCity: z.string().min(2, 'City is required'),
    storePhone: z.string().min(9, 'Valid phone number is required'),
});

const driverRequestSchema = z.object({
    vehicleType: z.string().min(2, 'Vehicle type is required'),
    plateNumber: z.string().min(3, 'Plate number is required'),
});

// Update Profile
export async function updateProfile(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        fullName: formData.get('fullName') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        city: formData.get('city') as string || undefined,
        address: formData.get('address') as string || undefined,
    };

    const validation = updateProfileSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { fullName, phone, city, address } = validation.data;

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone,
            city,
            address,
        })
        .eq('id', user.id);

    if (error) {
        console.error('[updateProfile] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Request Seller Activation
export async function requestSellerActivation(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if already requested or verified
    const { data: profile } = await supabase
        .from('profiles')
        .select('seller_requested, seller_verified')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.seller_verified) {
        return { success: false, error: 'Already verified as seller' };
    }

    if (profile?.seller_requested) {
        return { success: false, error: 'Already submitted a request' };
    }

    const rawData = {
        storeName: formData.get('storeName') as string,
        description: formData.get('description') as string || undefined,
        storeAddress: formData.get('storeAddress') as string,
        storeCity: formData.get('storeCity') as string,
        storePhone: formData.get('storePhone') as string,
    };

    const validation = sellerRequestSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { storeName, description, storeAddress, storeCity, storePhone } = validation.data;

    // Create seller record
    const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
            profile_id: user.id,
            store_name: storeName,
            description,
            store_address: storeAddress,
            store_city: storeCity,
            store_phone: storePhone,
            status: 'pending',
        });

    if (sellerError) {
        console.error('[requestSellerActivation] Error creating seller:', sellerError);
        return { success: false, error: sellerError.message };
    }

    // Update profile flag
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ seller_requested: true })
        .eq('id', user.id);

    if (profileError) {
        console.error('[requestSellerActivation] Error updating profile:', profileError);
        return { success: false, error: profileError.message };
    }

    return { success: true };
}

// Request Driver Activation
export async function requestDriverActivation(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if already requested or verified
    const { data: profile } = await supabase
        .from('profiles')
        .select('driver_requested, driver_verified')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.driver_verified) {
        return { success: false, error: 'Already verified as driver' };
    }

    if (profile?.driver_requested) {
        return { success: false, error: 'Already submitted a request' };
    }

    const rawData = {
        vehicleType: formData.get('vehicleType') as string,
        plateNumber: formData.get('plateNumber') as string,
    };

    const validation = driverRequestSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { vehicleType, plateNumber } = validation.data;

    // Create driver record
    const { error: driverError } = await supabase
        .from('drivers')
        .insert({
            profile_id: user.id,
            vehicle_type: vehicleType,
            plate_number: plateNumber,
            status: 'pending',
        });

    if (driverError) {
        console.error('[requestDriverActivation] Error creating driver:', driverError);
        return { success: false, error: driverError.message };
    }

    // Update profile flag
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ driver_requested: true })
        .eq('id', user.id);

    if (profileError) {
        console.error('[requestDriverActivation] Error updating profile:', profileError);
        return { success: false, error: profileError.message };
    }

    return { success: true };
}
