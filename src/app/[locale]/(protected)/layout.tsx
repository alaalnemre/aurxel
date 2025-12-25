import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const { user, profile, error } = await getProfile();

    // Not authenticated - redirect to login
    if (!user || error === 'Not authenticated') {
        redirect({ href: '/login', locale });
    }

    // Profile not found - this shouldn't happen with trigger, but handle gracefully
    if (!profile) {
        // Try to create profile manually or redirect
        redirect({ href: '/login', locale });
    }

    // User is authenticated, allow access to protected routes
    // Individual dashboard pages will handle role-specific authorization
    return <>{children}</>;
}
