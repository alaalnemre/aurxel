import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing';

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication check
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

    // Extract locale from path for routing decisions
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

    // Only check auth for protected or auth routes to minimize overhead
    if (isProtectedRoute || isAuthRoute) {
        // Create Supabase client just for auth check - lightweight
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll() {
                        // Intentionally empty - don't modify response here
                        // Session refresh happens in server components
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

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
    }

    // Run intlMiddleware for locale handling - SINGLE response
    return intlMiddleware(request);
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
