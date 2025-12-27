// src/app/[locale]/(protected)/admin/page.tsx
// Admin dashboard page

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminDashboard({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const user = await getUser();

    return <AdminContent userEmail={user?.email || 'Admin'} />;
}

function AdminContent({ userEmail }: { userEmail: string }) {
    const t = useTranslations('dashboard.admin');
    const tHealth = useTranslations('healthCheck');

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="mt-2 text-purple-100">
                    {t('welcome', { name: userEmail.split('@')[0] })}
                </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Users"
                    value="0"
                    subtitle="Total registered"
                    icon="👥"
                />
                <DashboardCard
                    title="Sellers"
                    value="0"
                    subtitle="Active vendors"
                    icon="🏪"
                />
                <DashboardCard
                    title="Orders"
                    value="0"
                    subtitle="Total processed"
                    icon="📦"
                />
                <DashboardCard
                    title="Revenue"
                    value="0 JOD"
                    subtitle="Platform total"
                    icon="📊"
                />
            </div>

            {/* System Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    System Status
                </h2>
                <div className="space-y-3">
                    <StatusItem label="Database" status="Connected" ok />
                    <StatusItem label="Authentication" status="Active" ok />
                    <StatusItem label="Storage" status="Ready" ok />
                </div>
            </div>

            {/* Health Check Badge */}
            <div className="rounded-lg bg-green-100 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <p>✅ {tHealth('serverRendering')}</p>
                <p>✅ {tHealth('sessionStatus', { status: 'Authenticated as Admin' })}</p>
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

function StatusItem({
    label,
    status,
    ok,
}: {
    label: string;
    status: string;
    ok: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${ok
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
            >
                {status}
            </span>
        </div>
    );
}
