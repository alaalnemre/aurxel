'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { applyRateLimit, isRateLimitError, getRateLimitMessage } from '@/lib/security/rate-limit';

/**
 * Get client identifier for rate limiting (IP-based for auth)
 */
async function getClientIdentifier(): Promise<string> {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || headersList.get('x-real-ip') || 'unknown';
    return ip;
}

/**
 * Create Supabase client for auth actions with proper cookie handling
 */
async function createAuthClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirect') as string | null;
    const locale = await getLocale();

    // Rate limiting
    try {
        const identifier = await getClientIdentifier();
        applyRateLimit('AUTH', identifier);
    } catch (error) {
        if (isRateLimitError(error)) {
            return { error: getRateLimitMessage(locale) };
        }
        throw error;
    }

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const supabase = await createAuthClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Redirect to the original destination or buyer dashboard
    // Use next/navigation redirect with full locale path
    if (redirectTo && redirectTo.startsWith('/')) {
        redirect(redirectTo);
    }

    redirect(`/${locale}/buyer`);
}

export async function register(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = (formData.get('role') as string) || 'buyer';
    const locale = await getLocale();

    // Rate limiting
    try {
        const identifier = await getClientIdentifier();
        applyRateLimit('AUTH', identifier);
    } catch (error) {
        if (isRateLimitError(error)) {
            return { error: getRateLimitMessage(locale) };
        }
        throw error;
    }

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
    }

    const supabase = await createAuthClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Redirect based on role after successful registration
    const dashboardPath = role === 'seller' ? '/seller' : '/buyer';
    redirect(`/${locale}${dashboardPath}`);
}

export async function logout() {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();

    const locale = await getLocale();
    redirect(`/${locale}`);
}
