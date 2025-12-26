'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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

    // Get user role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const role = profile?.role || 'buyer';
        redirect(`/${locale}/${role}`);
    }

    redirect(`/${locale}`);
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
    const role = formData.get('role') as string || 'buyer';

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
                role,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        // Profile is auto-created by trigger, just redirect
        redirect(`/${locale}/${role}`);
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

export async function getUserRole(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    return profile?.role || null;
}
