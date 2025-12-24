'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthResult = {
    success: boolean;
    error?: string;
};

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const locale = (formData.get('locale') as string) || 'en';

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                locale,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const locale = (formData.get('locale') as string) || 'en';

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect(`/${locale}/buyer`);
}

/**
 * Sign out
 */
export async function signOut(locale: string = 'en'): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect(`/${locale}`);
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const locale = formData.get('locale') as 'en' | 'ar';

    const updateData = {
        full_name: fullName,
        phone,
        locale,
    };

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

    if (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}

/**
 * Request password reset
 */
export async function resetPassword(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) {
        return { success: false, error: 'Email is required' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Apply to become a seller
 */
export async function applyAsSeller(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const businessName = formData.get('businessName') as string;
    const address = formData.get('address') as string;

    if (!businessName) {
        return { success: false, error: 'Business name is required' };
    }

    // Check if already a seller
    const { data: existingSeller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (existingSeller) {
        return { success: false, error: 'Already applied as seller' };
    }

    const sellerData = {
        user_id: user.id,
        business_name: businessName,
        address,
        status: 'pending',
    };

    const { error: sellerError } = await supabase
        .from('sellers')
        .insert(sellerData);

    if (sellerError) {
        console.error('Seller application error:', sellerError);
        return { success: false, error: sellerError.message };
    }

    const profileUpdate = { role: 'seller' };
    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

    if (profileError) {
        console.error('Profile update error:', profileError);
        return { success: false, error: profileError.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}

/**
 * Apply to become a driver
 */
export async function applyAsDriver(): Promise<AuthResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if already a driver
    const { data: existingDriver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (existingDriver) {
        return { success: false, error: 'Already applied as driver' };
    }

    const driverData = {
        user_id: user.id,
        status: 'pending',
    };

    const { error: driverError } = await supabase
        .from('drivers')
        .insert(driverData);

    if (driverError) {
        console.error('Driver application error:', driverError);
        return { success: false, error: driverError.message };
    }

    const driverProfileUpdate = { role: 'driver' };
    const { error: profileError } = await supabase
        .from('profiles')
        .update(driverProfileUpdate)
        .eq('id', user.id);

    if (profileError) {
        console.error('Profile update error:', profileError);
        return { success: false, error: profileError.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}
