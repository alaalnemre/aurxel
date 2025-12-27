// src/actions/auth.ts
// Server actions for authentication (registerUser, loginUser)

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

// ============================================
// RESULT TYPES
// ============================================

export type RegisterResult = {
    success: boolean;
    userId?: string;
    error?: string;
};

export type LoginResult = {
    success: boolean;
    redirectTo?: string;
    error?: string;
};

// ============================================
// registerUser
// ============================================
// Creates a new user with Supabase Auth.
// Profile row is auto-created by database trigger.
// Default: is_buyer=true, is_seller=false, is_driver=false, is_admin=false

export async function registerUser(
    email: string,
    password: string
): Promise<RegisterResult> {
    // Validate input
    const parsed = registerSchema.safeParse({ email, password });
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    try {
        const supabase = await createClient();

        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
        });

        if (error) {
            console.error('[registerUser] Auth error:', error.message);
            return {
                success: false,
                error: mapAuthError(error.message),
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Failed to create user account',
            };
        }

        // Check for existing user (email already registered)
        if (data.user.identities?.length === 0) {
            return {
                success: false,
                error: 'An account with this email already exists',
            };
        }

        // Profile row is auto-created by database trigger (handle_new_user)
        // with default flags: is_buyer=true, others=false

        return {
            success: true,
            userId: data.user.id,
        };
    } catch (err) {
        console.error('[registerUser] Unexpected error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

// ============================================
// loginUser
// ============================================
// Signs in user and returns redirect destination based on capabilities.
// Priority: admin > seller > driver > buyer

export async function loginUser(
    email: string,
    password: string
): Promise<LoginResult> {
    // Validate input
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message || 'Invalid input',
        };
    }

    try {
        const supabase = await createClient();

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
        });

        if (error) {
            console.error('[loginUser] Auth error:', error.message);
            return {
                success: false,
                error: mapAuthError(error.message),
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: 'Failed to sign in',
            };
        }

        // Fetch user profile to determine redirect
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin, is_seller, is_driver, is_buyer')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[loginUser] Profile fetch error:', profileError.message);
            // Still logged in, default to buyer
            return {
                success: true,
                redirectTo: '/buyer',
            };
        }

        // Determine redirect based on capabilities (priority order)
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
    } catch (err) {
        console.error('[loginUser] Unexpected error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapAuthError(message: string): string {
    // Map Supabase auth errors to user-friendly messages
    if (message.includes('Invalid login credentials')) {
        return 'Invalid email or password';
    }
    if (message.includes('Email not confirmed')) {
        return 'Please verify your email before signing in';
    }
    if (message.includes('User already registered')) {
        return 'An account with this email already exists';
    }
    if (message.includes('Password should be')) {
        return 'Password must be at least 8 characters';
    }
    return message;
}
