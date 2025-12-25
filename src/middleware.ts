import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/i18n/routing';

// Protected route patterns (without locale prefix)
const protectedPaths = ['/buyer', '/seller', '/driver', '/admin'];

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API routes
    if (
        pathname.includes('.') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // First, handle the intl routing
    const intlResponse = intlMiddleware(request);

    // Extract locale from path
    const pathParts = pathname.split('/');
    const locale = routing.locales.includes(pathParts[1] as 'en' | 'ar')
        ? pathParts[1]
        : routing.defaultLocale;

    // Check if this is a protected route
    const pathWithoutLocale = '/' + pathParts.slice(2).join('/');
    const isProtectedRoute = protectedPaths.some(
        (path) =>
            pathWithoutLocale === path || pathWithoutLocale.startsWith(path + '/')
    );

    if (isProtectedRoute) {
        // Update session and check auth
        const { user, supabaseResponse } = await updateSession(request);

        if (!user) {
            // Redirect to login with the current path as redirect
            const loginUrl = new URL(`/${locale}/login`, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // User is authenticated, merge cookies from supabase response
        const response = intlResponse || NextResponse.next({ request });
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value);
        });

        return response;
    }

    // For non-protected routes, just update session to keep it fresh
    // but don't require authentication
    const { supabaseResponse } = await updateSession(request);

    // Merge cookies
    const response = intlResponse || NextResponse.next({ request });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value);
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
