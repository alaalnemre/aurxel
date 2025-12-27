// src/app/[locale]/(protected)/seller/page.tsx
// Seller dashboard page

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function SellerDashboard({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const user = await getUser();

    return <SellerContent userEmail={user?.email || 'Seller'} />;
}

function SellerContent({ userEmail }: { userEmail: string }) {
    const t = useTranslations('dashboard.seller');
    const tHealth = useTranslations('healthCheck');

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="mt-2 text-emerald-100">
                    {t('welcome', { name: userEmail.split('@')[0] })}
                </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Products"
                    value="0"
                    subtitle="Active listings"
                    icon="📦"
                />
                <DashboardCard
                    title="Orders"
                    value="0"
                    subtitle="Pending"
                    icon="📋"
                />
                <DashboardCard
                    title="Revenue"
                    value="0 JOD"
                    subtitle="This month"
                    icon="💵"
                />
                <DashboardCard
                    title="Rating"
                    value="—"
                    subtitle="No reviews yet"
                    icon="⭐"
                />
            </div>

            {/* Health Check Badge */}
            <div className="rounded-lg bg-green-100 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <p>✅ {tHealth('serverRendering')}</p>
                <p>✅ {tHealth('sessionStatus', { status: 'Authenticated as Seller' })}</p>
            </div>
        </div>
    );
}

function DashboardCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}
