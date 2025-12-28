import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Protected routes that require authentication
const protectedPaths = ["/buyer", "/seller", "/driver", "/admin"];

// Public routes that don't require authentication
const publicOnlyPaths = ["/login", "/register", "/auth"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get locale from URL
    const locale = pathname.split("/")[1];
    const isValidLocale = routing.locales.includes(locale as "ar" | "en");
    const pathWithoutLocale = isValidLocale
        ? pathname.replace(`/${locale}`, "") || "/"
        : pathname;

    // Check if path is protected or public-only
    const isProtectedPath = protectedPaths.some((path) =>
        pathWithoutLocale.startsWith(path)
    );
    const isPublicOnlyPath = publicOnlyPaths.some((path) =>
        pathWithoutLocale.startsWith(path)
    );

    // Create Supabase client for session check
    let response = intlMiddleware(request);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const currentLocale = isValidLocale ? locale : routing.defaultLocale;

    // Handle protected routes
    if (isProtectedPath && !user) {
        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Handle public-only routes (redirect logged-in users)
    if (isPublicOnlyPath && user) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin, is_seller, is_driver")
            .eq("id", user.id)
            .maybeSingle();

        let redirectPath = `/${currentLocale}/store`;
        if (profile?.is_admin) {
            redirectPath = `/${currentLocale}/admin`;
        } else if (profile?.is_seller) {
            redirectPath = `/${currentLocale}/seller`;
        } else if (profile?.is_driver) {
            redirectPath = `/${currentLocale}/driver`;
        } else {
            redirectPath = `/${currentLocale}/store`;
        }

        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
