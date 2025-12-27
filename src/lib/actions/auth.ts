// src/lib/actions/auth.ts
// Server actions for authentication

'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from '@/lib/validations/auth';
import type { Profile } from '@/lib/types/database';

// ============================================
// RESULT TYPES
// ============================================

export type AuthResult = {
    success: boolean;
    error?: string;
    redirectTo?: string;
};

export type ProfileResult = {
    success: boolean;
    profile?: Profile;
    error?: string;
};

// ============================================
// REGISTER USER
// ============================================

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
    // Validate input
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    const { email, password, fullName } = parsed.data;

    // Create Supabase client
    const supabase = await createClient();

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        console.error('[registerUser] Supabase error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: 'Failed to create user',
        };
    }

    // Check if email confirmation is required
    if (data.user.identities?.length === 0) {
        return {
            success: false,
            error: 'Email already registered',
        };
    }

    // Success - profile is auto-created by database trigger
    return {
        success: true,
        redirectTo: '/buyer',
    };
}

// ============================================
// LOGIN USER
// ============================================

export async function loginUser(input: LoginInput): Promise<AuthResult> {
    // Validate input
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    const { email, password } = parsed.data;

    // Create Supabase client
    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('[loginUser] Supabase error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: 'Failed to sign in',
        };
    }

    // Fetch profile to determine redirect
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

    if (profileError) {
        console.error('[loginUser] Profile fetch error:', profileError.message);
        // Still logged in, just redirect to buyer
        return {
            success: true,
            redirectTo: '/buyer',
        };
    }

    // Determine redirect based on capabilities
    let redirectTo = '/buyer';
    if (profile) {
        if (profile.is_admin) {
            redirectTo = '/admin';
        } else if (profile.is_seller) {
            redirectTo = '/seller';
        } else if (profile.is_driver) {
            redirectTo = '/driver';
        }
    }

    return {
        success: true,
        redirectTo,
    };
}

// ============================================
// LOGOUT USER
// ============================================

export async function logoutUser(): Promise<AuthResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[logoutUser] Supabase error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
        redirectTo: '/login',
    };
}

// ============================================
// GET CURRENT PROFILE
// ============================================

export async function getCurrentProfile(): Promise<ProfileResult> {
    const user = await getUser();

    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        };
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getCurrentProfile] Supabase error:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }

    if (!profile) {
        return {
            success: false,
            error: 'Profile not found',
        };
    }

    return {
        success: true,
        profile: profile as Profile,
    };
}
