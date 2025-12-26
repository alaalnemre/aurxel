import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params;
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || `/${locale}`;

    // If no code, redirect to login
    if (!code) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
        const supabase = await createClient();

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[auth/callback] Error exchanging code:', error.message);
            return NextResponse.redirect(
                new URL(`/${locale}/login?error=auth_error`, request.url)
            );
        }

        // Successful authentication - redirect to intended destination
        // Ensure the redirect path is valid
        const redirectPath = next.startsWith('/') ? next : `/${locale}`;
        return NextResponse.redirect(new URL(redirectPath, request.url));

    } catch (error) {
        console.error('[auth/callback] Unexpected error:', error);
        return NextResponse.redirect(
            new URL(`/${locale}/login?error=unexpected`, request.url)
        );
    }
}
