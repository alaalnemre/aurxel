// src/lib/actions/capabilities.ts
// Server actions for user capability management (seller, driver)

'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import {
    becomeSellerSchema,
    becomeDriverSchema,
    type BecomeSellerInput,
    type BecomeDriverInput,
} from '@/lib/validations/auth';
import type { SellerProfile, DriverProfile } from '@/lib/types/database';

// ============================================
// RESULT TYPES
// ============================================

export type CapabilityResult = {
    success: boolean;
    error?: string;
};

export type SellerProfileResult = {
    success: boolean;
    sellerProfile?: SellerProfile;
    error?: string;
};

export type DriverProfileResult = {
    success: boolean;
    driverProfile?: DriverProfile;
    error?: string;
};

// ============================================
// BECOME A SELLER
// ============================================

export async function becomeSeller(input: BecomeSellerInput): Promise<CapabilityResult> {
    // Validate input
    const parsed = becomeSellerSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    const { storeName, storeDescription } = parsed.data;

    // Get current user
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        };
    }

    const supabase = await createClient();

    // Check if already a seller
    const { data: existingSeller } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingSeller) {
        return {
            success: false,
            error: 'You have already applied to become a seller',
        };
    }

    // Create seller profile (status defaults to 'pending')
    const { error: insertError } = await supabase
        .from('seller_profiles')
        .insert({
            user_id: user.id,
            store_name: storeName,
            store_description: storeDescription || null,
        });

    if (insertError) {
        console.error('[becomeSeller] Insert error:', insertError.message);
        return {
            success: false,
            error: insertError.message,
        };
    }

    // Note: is_seller flag on profiles table will be set to true
    // by admin when they approve the seller application

    return {
        success: true,
    };
}

// ============================================
// BECOME A DRIVER
// ============================================

export async function becomeDriver(input: BecomeDriverInput): Promise<CapabilityResult> {
    // Validate input
    const parsed = becomeDriverSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    const { vehicleType, licenseNumber } = parsed.data;

    // Get current user
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        };
    }

    const supabase = await createClient();

    // Check if already a driver
    const { data: existingDriver } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingDriver) {
        return {
            success: false,
            error: 'You have already applied to become a driver',
        };
    }

    // Create driver profile (status defaults to 'pending')
    const { error: insertError } = await supabase
        .from('driver_profiles')
        .insert({
            user_id: user.id,
            vehicle_type: vehicleType || null,
            license_number: licenseNumber || null,
        });

    if (insertError) {
        console.error('[becomeDriver] Insert error:', insertError.message);
        return {
            success: false,
            error: insertError.message,
        };
    }

    // Note: is_driver flag on profiles table will be set to true
    // by admin when they approve the driver application

    return {
        success: true,
    };
}

// ============================================
// GET SELLER PROFILE
// ============================================

export async function getSellerProfile(): Promise<SellerProfileResult> {
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        };
    }

    const supabase = await createClient();

    const { data: sellerProfile, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getSellerProfile] Error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
        sellerProfile: sellerProfile as SellerProfile | undefined,
    };
}

// ============================================
// GET DRIVER PROFILE
// ============================================

export async function getDriverProfile(): Promise<DriverProfileResult> {
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        };
    }

    const supabase = await createClient();

    const { data: driverProfile, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getDriverProfile] Error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
        driverProfile: driverProfile as DriverProfile | undefined,
    };
}
