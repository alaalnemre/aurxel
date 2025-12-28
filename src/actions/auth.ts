"use server";

import { createUserClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export interface AuthResult {
    success: boolean;
    error?: string;
    redirectTo?: string;
}

export async function loginUser(
    email: string,
    password: string
): Promise<AuthResult> {
    const supabase = await createUserClient();
    const locale = (await getLocale()) as Locale;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("[loginUser] Error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: "Login failed",
        };
    }

    // Get user profile to determine redirect
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, is_seller, seller_verified, is_driver, driver_verified")
        .eq("id", data.user.id)
        .maybeSingle() as { data: { is_admin: boolean; is_seller: boolean; seller_verified: boolean; is_driver: boolean; driver_verified: boolean } | null };

    // Determine redirect based on capabilities
    let redirectPath = `/${locale}/store`;

    if (profile?.is_admin) {
        redirectPath = `/${locale}/admin`;
    } else if (profile?.is_seller && profile?.seller_verified) {
        redirectPath = `/${locale}/seller`;
    } else if (profile?.is_driver && profile?.driver_verified) {
        redirectPath = `/${locale}/driver`;
    } else {
        redirectPath = `/${locale}/store`;
    }

    return {
        success: true,
        redirectTo: redirectPath,
    };
}

export async function registerUser(
    email: string,
    password: string,
    fullName: string,
    phone?: string
): Promise<AuthResult> {
    const supabase = await createUserClient();
    const locale = (await getLocale()) as Locale;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone || null,
            },
        },
    });

    if (error) {
        console.error("[registerUser] Error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: "Registration failed",
        };
    }

    return {
        success: true,
        redirectTo: `/${locale}/store`,
    };
}

export async function logoutUser(): Promise<void> {
    const supabase = await createUserClient();
    const locale = (await getLocale()) as Locale;

    await supabase.auth.signOut();

    redirect({ href: "/login", locale });
}

export async function resetPassword(email: string): Promise<AuthResult> {
    const supabase = await createUserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
    });

    if (error) {
        console.error("[resetPassword] Error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
    const supabase = await createUserClient();

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        console.error("[updatePassword] Error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}
