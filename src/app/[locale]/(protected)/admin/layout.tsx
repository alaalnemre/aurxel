import { redirect } from 'next/navigation';
import { getUser, getProfile } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/store`);
    }

    return <>{children}</>;
}
