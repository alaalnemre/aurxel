import { redirect } from 'next/navigation';
import { getUser, getProfile } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';

export const runtime = 'nodejs';

export default async function ProtectedLayout({
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header locale={locale} profile={profile} />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
