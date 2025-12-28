import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // First, update the Supabase session
    const response = await updateSession(request);

    // Then apply intl middleware
    const intlResponse = intlMiddleware(request);

    // Merge cookies from Supabase response into intl response
    response.cookies.getAll().forEach(cookie => {
        intlResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie,
        });
    });

    return intlResponse;
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - api routes
        // - static files
        // - _next
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
