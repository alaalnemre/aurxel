import { redirect } from 'next/navigation';
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
    const { user, error } = await getProfile();

    // Not authenticated - redirect to login
    // This is the ONLY redirect condition
    if (!user || error === 'Not authenticated') {
        redirect(`/${locale}/login`);
    }

    // Profile may or may not exist - that's OK
    // getProfile() auto-creates if missing
    // Individual pages handle role-specific authorization via authorize()

    return <>{children}</>;
}
