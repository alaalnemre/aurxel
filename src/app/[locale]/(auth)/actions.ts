'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
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

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Redirect to the original destination or buyer dashboard
    if (redirectTo && redirectTo.startsWith('/')) {
        redirect({ href: redirectTo, locale });
    }

    redirect({ href: '/buyer', locale });
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

    const supabase = await createClient();

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
    redirect({ href: dashboardPath, locale });
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const locale = await getLocale();
    redirect({ href: '/', locale });
}

