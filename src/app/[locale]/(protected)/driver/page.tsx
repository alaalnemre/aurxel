import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { getQanzBalance } from '@/lib/qanz/actions';
import { getUnreadCount } from '@/lib/notifications/actions';
import { NotificationBell } from '@/components/notifications/NotificationBell';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DriverDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const [balance, unreadCount] = await Promise.all([
        getQanzBalance(),
        getUnreadCount(),
    ]);

    return <DriverDashboardContent user={user} balance={balance} unreadCount={unreadCount} />;
}

function DriverDashboardContent({ user, balance, unreadCount }: { user: { email?: string } | null; balance: number; unreadCount: number }) {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-indigo-600">
                                {t('common.appName')}
                            </Link>
                            <span className="ml-4 px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                                Driver
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell initialCount={unreadCount} />
                            <Link
                                href="/wallet"
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                            >
                                💳 {balance.toFixed(0)} QANZ
                            </Link>
                            <span className="text-sm text-gray-600">{user?.email}</span>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {t('dashboard.driver.title')}
                        </h1>
                        <p className="mt-2 text-gray-600">{t('dashboard.driver.welcome')}</p>
                    </div>
                    {/* Status Toggle */}
                    <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                        <span className="text-sm text-gray-600">
                            {t('dashboard.driver.status')}:
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {t('dashboard.driver.online')}
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Deliveries Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.driver.activeDeliveries')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-orange-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {t('dashboard.driver.noDeliveries')}
                        </p>
                    </div>

                    {/* Completed Deliveries Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.driver.completedDeliveries')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">today</p>
                    </div>

                    {/* Earnings Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.driver.earnings')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            0 <span className="text-lg font-normal text-gray-500">JOD</span>
                        </p>
                        <p className="text-gray-500 text-sm mt-1">this week</p>
                    </div>
                </div>

                {/* Available Deliveries Section */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Available Deliveries
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                        <p className="text-gray-500">
                            No deliveries available at the moment
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            New deliveries will appear here when sellers mark orders as ready
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
