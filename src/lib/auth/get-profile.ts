import { createClient } from '@/lib/supabase/server';
import type { Profile, SellerProfile, DriverProfile } from '@/lib/types/database';

export interface ProfileResult {
    user: {
        id: string;
        email: string;
    } | null;
    profile: Profile | null;
    sellerProfile: SellerProfile | null;
    driverProfile: DriverProfile | null;
    error: string | null;
}

/**
 * Get the current user's profile and role-specific data from database.
 * Uses supabase.auth.getUser() for secure authentication.
 * AUTO-CREATES profile if it doesn't exist (safety net if trigger fails).
 */
export async function getProfile(): Promise<ProfileResult> {
    const supabase = await createClient();

    // Get authenticated user (secure method)
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null,
            profile: null,
            sellerProfile: null,
            driverProfile: null,
            error: 'Not authenticated',
        };
    }

    // Get profile from database
    let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) {
        console.error('[getProfile] Profile fetch error:', profileError);
    }

    // AUTO-CREATE profile if missing (safety net)
    if (!profile) {
        console.log('[getProfile] Creating missing profile for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                role: 'buyer',
                full_name: user.user_metadata?.full_name || '',
                email: user.email,
            })
            .select()
            .single();

        if (createError) {
            console.error('[getProfile] Failed to create profile:', createError);
            // Still return user info even if profile creation fails
            return {
                user: { id: user.id, email: user.email || '' },
                profile: null,
                sellerProfile: null,
                driverProfile: null,
                error: 'Failed to create profile',
            };
        }
        profile = newProfile;
    }

    // Fetch role-specific profiles based on role
    let sellerProfile: SellerProfile | null = null;
    let driverProfile: DriverProfile | null = null;

    if (profile.role === 'seller') {
        const { data } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
        sellerProfile = data;
    }

    if (profile.role === 'driver') {
        const { data } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
        driverProfile = data;
    }

    return {
        user: { id: user.id, email: user.email || '' },
        profile: profile as Profile,
        sellerProfile,
        driverProfile,
        error: null,
    };
}
