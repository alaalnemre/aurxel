// src/app/[locale]/(protected)/admin/page.tsx
// Admin placeholder page - verifies admin access

import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth guard
    const user = await getUser();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Verify admin status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        redirect(`/${locale}/buyer`);
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="mt-4 text-gray-600">
                Admin dashboard coming soon
            </p>
        </div>
    );
}
