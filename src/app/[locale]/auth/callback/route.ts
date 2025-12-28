import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params;
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[Auth Callback] Error:', error);
            return NextResponse.redirect(new URL(`/${locale}/login?error=auth_error`, requestUrl.origin));
        }
    }

    // Redirect to store after successful auth
    return NextResponse.redirect(new URL(`/${locale}/store`, requestUrl.origin));
}
