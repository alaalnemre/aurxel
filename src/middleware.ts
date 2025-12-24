import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/i18n/routing';

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/buyer', '/seller', '/driver', '/admin'];

// Routes that are only for non-authenticated users
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Update Supabase session (refreshes tokens if needed)
    const { supabaseResponse, user } = await updateSession(request);

    // Apply intl middleware for locale handling
    const intlResponse = intlMiddleware(request);

    // Copy cookies from Supabase response to intl response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie,
        });
    });

    // Extract locale from path
    const pathLocale = pathname.split('/')[1];
    const locale = routing.locales.includes(pathLocale as 'en' | 'ar')
        ? pathLocale
        : routing.defaultLocale;

    // Check if path is protected (after removing locale prefix)
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    const isProtectedRoute = protectedRoutes.some(route =>
        pathWithoutLocale.startsWith(route)
    );
    const isAuthRoute = authRoutes.some(route =>
        pathWithoutLocale.startsWith(route)
    );

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !user) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if accessing auth routes while logged in
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL(`/${locale}/buyer`, request.url));
    }

    return intlResponse;
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - API routes
        // - _next (Next.js internals)
        // - Static files
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ],
};
