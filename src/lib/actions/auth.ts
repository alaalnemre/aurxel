'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { RegisterFormData, LoginFormData } from '@/lib/types/database';

/**
 * Register a new user and create their profile
 */
export async function registerUser(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get(' email') as string;
    const password = formData.get('password') as string;
    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                phone,
                role,
            },
        },
    });

    if (authError) {
        console.error('[Auth] Registration error:', authError.message);
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error('Registration failed - no user returned');
    }

    // Profile is automatically created by the handle_new_user trigger
    // Redirect based on role
    const locale = 'ar'; // Default locale

    switch (role) {
        case 'vendor':
            redirect(`/${locale}/vendor/onboarding`);
        case 'driver':
            redirect(`/${locale}/driver`);
        case 'admin':
            redirect(`/${locale}/admin`);
        default:
            redirect(`/${locale}/shop`);
    }
}

/**
 * Login an existing user
 */
export async function loginUser(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('[Auth] Login error:', authError.message);
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error('Login failed - no user returned');
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

    if (profileError || !profile) {
        console.error('[Auth] Profile fetch error:', profileError?.message);
        throw new Error('Failed to fetch user profile');
    }

    // Redirect based on role
    const locale = 'ar'; // Default locale

    switch (profile.role) {
        case 'vendor':
            redirect(`/${locale}/vendor`);
        case 'driver':
            redirect(`/${locale}/driver`);
        case 'admin':
            redirect(`/${locale}/admin`);
        default:
            redirect(`/${locale}/shop`);
    }
}

/**
 * Logout the current user
 */
export async function logoutUser() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[Auth] Logout error:', error.message);
        throw new Error(error.message);
    }

    redirect('/ar'); // Redirect to Arabic homepage
}

/**
 * Get the current user's profile
 */
export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError || !profile) {
        console.error('[Auth] Profile fetch error:', profileError?.message);
        return null;
    }

    return {
        ...user,
        profile,
    };
}

/**
 * Check if user has a specific role
 */
export async function checkUserRole(allowedRoles: string[]) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        return false;
    }

    return allowedRoles.includes(profile.role);
}
