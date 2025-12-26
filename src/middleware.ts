// src/middleware.ts
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

// Public routes (locale-prefixed or not handled by intl middleware)
const PUBLIC_PATHS = [
    '/', // handled by intl middleware
    '/login',
    '/register',
    '/join-terms',
    '/auth/callback',
    '/forgot-password'
];

// Protected top-level prefixes (WITHOUT locale)
const PROTECTED_PREFIXES = ['/buyer', '/seller', '/driver', '/admin', '/wallet', '/notifications', '/checkout'];

function stripLocale(pathname: string) {
    // pathname: /en/seller => /seller
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'en' || parts[0] === 'ar') {
        return '/' + parts.slice(1).join('/');
    }
    return pathname;
}

function isPublicPath(pathnameNoLocale: string) {
    // exact matches OR startsWith for callback paths
    return (
        PUBLIC_PATHS.includes(pathnameNoLocale) ||
        PUBLIC_PATHS.some((p) => p !== '/' && pathnameNoLocale.startsWith(p))
    );
}

function isProtectedPath(pathnameNoLocale: string) {
    return PROTECTED_PREFIXES.some(
        (p) => pathnameNoLocale === p || pathnameNoLocale.startsWith(p + '/')
    );
}

// next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
    // 1) Always run intl middleware first (sets locale routing & redirects / -> /en or /ar)
    const intlRes = intlMiddleware(req);

    // 2) Refresh Supabase session cookies (important for login to "stick")
    // updateSession expects a NextResponse to attach cookies to
    const res = intlRes ?? NextResponse.next();
    const { user } = await updateSession(req, res);

    // 3) Minimal route protection (NO role checks here)
    const pathnameNoLocale = stripLocale(req.nextUrl.pathname);

    // allow public always
    if (isPublicPath(pathnameNoLocale)) return res;

    // protect specific prefixes only
    if (isProtectedPath(pathnameNoLocale) && !user) {
        const locale = req.nextUrl.pathname.split('/').filter(Boolean)[0];
        const effectiveLocale = locale === 'en' || locale === 'ar' ? locale : routing.defaultLocale;

        const url = req.nextUrl.clone();
        url.pathname = `/${effectiveLocale}/login`;
        url.searchParams.set('next', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return res;
}

// IMPORTANT: do NOT match static assets
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'
    ]
};
