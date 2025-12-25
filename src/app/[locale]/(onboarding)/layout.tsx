import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const locale = await getLocale();

    // Check if user is authenticated
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect({ href: '/login', locale });
    }

    return <>{children}</>;
}
