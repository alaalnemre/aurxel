'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Validation Schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Types
export type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Register User
export async function registerUser(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        fullName: formData.get('fullName') as string,
    };

    const validation = registerSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { email, password, fullName } = validation.data;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        console.error('[registerUser] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Login User
export async function loginUser(formData: FormData): Promise<ActionResult<{ redirectTo: string }>> {
    const supabase = await createClient();

    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    const locale = (formData.get('locale') as string) || 'en';

    const validation = loginSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { email, password } = validation.data;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('[loginUser] Error:', error);
        return { success: false, error: error.message };
    }

    if (!data.user) {
        return { success: false, error: 'Login failed' };
    }

    // Get profile to determine redirect
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, seller_verified, driver_verified')
        .eq('id', data.user.id)
        .maybeSingle();

    let redirectTo = `/${locale}/store`;

    if (profile?.is_admin) {
        redirectTo = `/${locale}/admin`;
    } else if (profile?.seller_verified) {
        redirectTo = `/${locale}/seller`;
    } else if (profile?.driver_verified) {
        redirectTo = `/${locale}/driver`;
    }

    return { success: true, data: { redirectTo } };
}

// Logout User
export async function logoutUser(): Promise<ActionResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[logoutUser] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Request Password Reset
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const rawData = {
        email: formData.get('email') as string,
    };

    const locale = (formData.get('locale') as string) || 'en';

    const validation = resetPasswordSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { email } = validation.data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/reset-password/update`,
    });

    if (error) {
        console.error('[requestPasswordReset] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Update Password
export async function updatePassword(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const rawData = {
        password: formData.get('password') as string,
    };

    const validation = updatePasswordSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { password } = validation.data;

    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        console.error('[updatePassword] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
