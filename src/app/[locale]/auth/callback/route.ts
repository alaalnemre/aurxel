import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

    if (!code) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('[auth/callback] Error:', error.message);
        return NextResponse.redirect(
            new URL(`/${locale}/login?error=auth_error`, request.url)
        );
    }

    const redirectPath = next.startsWith('/') ? next : `/${locale}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
}
