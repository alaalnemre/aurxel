'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPrimaryDashboard } from '@/lib/types/database';

export type AuthActionResult = {
    error?: string;
    success?: boolean;
};

export async function signIn(
    locale: string,
    formData: FormData
): Promise<AuthActionResult> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Get user and profile for capability-based redirect
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_buyer, is_seller, is_driver, is_admin')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            const dashboard = getPrimaryDashboard(profile);
            redirect(`/${locale}/${dashboard}`);
        }
    }

    // Fallback to buyer dashboard
    redirect(`/${locale}/buyer`);
}

export async function signUp(
    locale: string,
    formData: FormData
): Promise<AuthActionResult> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    // No role selection - all users start as buyers

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone,
                // No role in metadata - trigger sets is_buyer=true by default
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        // All new users go to buyer dashboard
        redirect(`/${locale}/buyer`);
    }

    return { success: true };
}

export async function signOut(locale: string) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(`/${locale}`);
}

export async function getSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    return profile;
}

export async function getUserCapabilities() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_buyer, is_seller, is_driver, is_admin')
        .eq('id', user.id)
        .maybeSingle();

    return profile;
}
