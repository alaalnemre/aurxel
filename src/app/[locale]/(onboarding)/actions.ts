'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';

export interface OnboardingResult {
    success: boolean;
    error?: string;
}

/**
 * Submit seller onboarding application
 */
export async function submitSellerOnboarding(
    formData: FormData
): Promise<OnboardingResult | never> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile) {
        return { success: false, error: 'Not authenticated' };
    }

    const businessName = formData.get('businessName') as string;
    const businessAddress = formData.get('businessAddress') as string;
    const businessPhone = formData.get('businessPhone') as string;
    const businessDescription = formData.get('businessDescription') as string;
    const acceptTerms = formData.get('acceptTerms') === 'on';

    // Server-side terms acceptance validation
    if (!acceptTerms) {
        return { success: false, error: 'You must accept the Join Terms to continue' };
    }

    if (!businessName?.trim()) {
        return { success: false, error: 'Business name is required' };
    }

    // Check if seller profile already exists
    const { data: existingProfile } = await supabase
        .from('seller_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingProfile) {
        // Already submitted
        if (existingProfile.status === 'pending') {
            redirect({ href: '/seller/pending', locale });
        } else if (existingProfile.status === 'approved') {
            redirect({ href: '/seller', locale });
        }
        return { success: false, error: 'Application already submitted' };
    }

    // Update user role to seller and mark terms accepted
    const { error: roleError } = await supabase
        .from('profiles')
        .update({
            role: 'seller',
            accepted_join_terms: true,
            accepted_join_terms_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (roleError) {
        console.error('[submitSellerOnboarding] Role update error:', roleError);
        return { success: false, error: 'Failed to update role' };
    }

    // Create seller profile
    const { error: insertError } = await supabase.from('seller_profiles').insert({
        user_id: user.id,
        business_name: businessName.trim(),
        business_address: businessAddress?.trim() || null,
        business_phone: businessPhone?.trim() || null,
        business_description: businessDescription?.trim() || null,
        status: 'pending',
    });

    if (insertError) {
        console.error('[submitSellerOnboarding] Insert error:', insertError);
        // Rollback role change
        await supabase.from('profiles').update({ role: 'buyer' }).eq('id', user.id);
        return { success: false, error: 'Failed to submit application' };
    }

    // Redirect to pending page
    redirect({ href: '/seller/pending', locale });
    // The redirect function throws, so this is unreachable, but satisfies TypeScript
    return { success: true };
}

/**
 * Submit driver onboarding application
 */
export async function submitDriverOnboarding(
    formData: FormData
): Promise<OnboardingResult | never> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile) {
        return { success: false, error: 'Not authenticated' };
    }

    const vehicleType = formData.get('vehicleType') as string;
    const vehiclePlate = formData.get('vehiclePlate') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const acceptTerms = formData.get('acceptTerms') === 'on';

    // Server-side terms acceptance validation
    if (!acceptTerms) {
        return { success: false, error: 'You must accept the Join Terms to continue' };
    }

    if (!vehicleType?.trim()) {
        return { success: false, error: 'Vehicle type is required' };
    }

    // Check if driver profile already exists
    const { data: existingProfile } = await supabase
        .from('driver_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingProfile) {
        // Already submitted
        if (existingProfile.status === 'pending') {
            redirect({ href: '/driver/pending', locale });
        } else if (existingProfile.status === 'approved') {
            redirect({ href: '/driver', locale });
        }
        return { success: false, error: 'Application already submitted' };
    }

    // Update user role to driver and mark terms accepted
    const { error: roleError } = await supabase
        .from('profiles')
        .update({
            role: 'driver',
            accepted_join_terms: true,
            accepted_join_terms_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (roleError) {
        console.error('[submitDriverOnboarding] Role update error:', roleError);
        return { success: false, error: 'Failed to update role' };
    }

    // Create driver profile
    const { error: insertError } = await supabase.from('driver_profiles').insert({
        user_id: user.id,
        vehicle_type: vehicleType.trim(),
        vehicle_plate: vehiclePlate?.trim() || null,
        license_number: licenseNumber?.trim() || null,
        status: 'pending',
    });

    if (insertError) {
        console.error('[submitDriverOnboarding] Insert error:', insertError);
        // Rollback role change
        await supabase.from('profiles').update({ role: 'buyer' }).eq('id', user.id);
        return { success: false, error: 'Failed to submit application' };
    }

    // Redirect to pending page
    redirect({ href: '/driver/pending', locale });
    // The redirect function throws, so this is unreachable, but satisfies TypeScript
    return { success: true };
}
