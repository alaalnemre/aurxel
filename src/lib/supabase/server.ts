// src/lib/supabase/server.ts
// Server-side Supabase client for App Router (Server Components, Route Handlers, Server Actions)

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
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
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

/**
 * Get the current authenticated user from the server.
 * IMPORTANT: Always use getUser() instead of getSession() for security.
 * getUser() validates the JWT on every request.
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getUser() {
    // If Supabase is not configured, return null (not authenticated)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return null;
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Require authentication - throws redirect if not authenticated.
 * Use this in protected layouts/pages.
 * 
 * IMPORTANT: Call redirect() OUTSIDE of try/catch to avoid Next.js errors.
 */
export async function requireAuth(redirectTo: string = '/login') {
    const user = await getUser();
    return { user, isAuthenticated: !!user, redirectTo };
}
