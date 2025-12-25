import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
    console.log('[UPDATE_SESSION] Start');
    console.log('[UPDATE_SESSION] Request cookie names:', request.cookies.getAll().map(c => c.name).join(', '));

    // Use the provided response object - do NOT create a new one
    // This ensures we mutate the same response that intlMiddleware created

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const cookies = request.cookies.getAll();
                    console.log('[UPDATE_SESSION] getAll called, count:', cookies.length);
                    return cookies;
                },
                setAll(cookiesToSet) {
                    console.log('[UPDATE_SESSION] setAll called, count:', cookiesToSet.length);
                    // Update request cookies for downstream handlers
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Set cookies on the SAME response object passed in
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('[UPDATE_SESSION] Auth error:', error.message, error.code);
    }

    console.log('[UPDATE_SESSION] User result:', user?.id || 'null', user?.email || 'no-email');
    console.log('[UPDATE_SESSION] End');

    return { response, user };
}
