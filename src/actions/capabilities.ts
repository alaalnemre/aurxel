// src/actions/capabilities.ts
// Server actions for user capabilities (becomeSeller, becomeDriver)

'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const becomeSellerSchema = z.object({
    storeName: z.string().min(3, 'Store name must be at least 3 characters').max(100),
});

// ============================================
// RESULT TYPES
// ============================================

export type CapabilityResult = {
    success: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    error?: string;
};

// ============================================
// becomeSeller
// ============================================
// Creates a seller profile and sets is_seller = true on profiles.
// Status starts as 'pending' for admin approval.

export async function becomeSeller(storeName: string): Promise<CapabilityResult> {
    // Validate input
    const parsed = becomeSellerSchema.safeParse({ storeName });
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    // Require authenticated user
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'You must be logged in to become a seller',
        };
    }

    try {
        const supabase = await createClient();

        // Check if seller profile already exists
        const { data: existingSeller, error: checkError } = await supabase
            .from('seller_profiles')
            .select('id, status')
            .eq('user_id', user.id)
            .maybeSingle();

        if (checkError) {
            console.error('[becomeSeller] Check error:', checkError.message);
            return {
                success: false,
                error: 'Failed to check existing application',
            };
        }

        if (existingSeller) {
            return {
                success: false,
                error: 'You have already applied to become a seller',
                status: existingSeller.status,
            };
        }

        // Insert seller profile with status = 'pending'
        const { error: insertError } = await supabase
            .from('seller_profiles')
            .insert({
                user_id: user.id,
                store_name: parsed.data.storeName,
                status: 'pending',
            });

        if (insertError) {
            console.error('[becomeSeller] Insert error:', insertError.message);
            return {
                success: false,
                error: 'Failed to submit seller application',
            };
        }

        // Update profiles.is_seller = true
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_seller: true })
            .eq('id', user.id);

        if (updateError) {
            console.error('[becomeSeller] Profile update error:', updateError.message);
            // Seller profile was created, but flag update failed
            // This is not critical, but log it
        }

        return {
            success: true,
            status: 'pending',
        };
    } catch (err) {
        console.error('[becomeSeller] Unexpected error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

// ============================================
// becomeDriver
// ============================================
// Creates a driver profile and sets is_driver = true on profiles.
// Status starts as 'pending' for admin approval.

export async function becomeDriver(): Promise<CapabilityResult> {
    // Require authenticated user
    const user = await getUser();
    if (!user) {
        return {
            success: false,
            error: 'You must be logged in to become a driver',
        };
    }

    try {
        const supabase = await createClient();

        // Check if driver profile already exists
        const { data: existingDriver, error: checkError } = await supabase
            .from('driver_profiles')
            .select('id, status')
            .eq('user_id', user.id)
            .maybeSingle();

        if (checkError) {
            console.error('[becomeDriver] Check error:', checkError.message);
            return {
                success: false,
                error: 'Failed to check existing application',
            };
        }

        if (existingDriver) {
            return {
                success: false,
                error: 'You have already applied to become a driver',
                status: existingDriver.status,
            };
        }

        // Insert driver profile with status = 'pending'
        const { error: insertError } = await supabase
            .from('driver_profiles')
            .insert({
                user_id: user.id,
                status: 'pending',
            });

        if (insertError) {
            console.error('[becomeDriver] Insert error:', insertError.message);
            return {
                success: false,
                error: 'Failed to submit driver application',
            };
        }

        // Update profiles.is_driver = true
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_driver: true })
            .eq('id', user.id);

        if (updateError) {
            console.error('[becomeDriver] Profile update error:', updateError.message);
            // Driver profile was created, but flag update failed
            // This is not critical, but log it
        }

        return {
            success: true,
            status: 'pending',
        };
    } catch (err) {
        console.error('[becomeDriver] Unexpected error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}
