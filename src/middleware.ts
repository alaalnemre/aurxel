// src/middleware.ts
// Middleware for locale detection, routing, and Supabase session refresh

import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing';

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
    // First, handle locale routing with next-intl
    const intlResponse = intlMiddleware(request);

    // If Supabase env vars are not configured, skip session refresh
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return intlResponse;
    }

    // Create a response that we can modify
    let response = intlResponse || NextResponse.next({ request });

    // Create Supabase client for session refresh
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Update the response cookies
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session token
    await supabase.auth.getUser();

    return response;
}

export const config = {
    // Match all pathnames except for:
    // - API routes
    // - Static files (assets, images, etc.)
    // - Next.js internals
    matcher: [
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ],
};
