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

export default async function SellerDashboard({
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

    return <SellerDashboardContent user={user} balance={balance} unreadCount={unreadCount} />;
}

function SellerDashboardContent({ user, balance, unreadCount }: { user: { email?: string } | null; balance: number; unreadCount: number }) {
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
                            <span className="ml-4 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
                                Seller
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('dashboard.seller.title')}
                    </h1>
                    <p className="mt-2 text-gray-600">{t('dashboard.seller.welcome')}</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Products Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.seller.products')}
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
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {t('dashboard.seller.noProducts')}
                        </p>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.seller.orders')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">pending orders</p>
                    </div>

                    {/* Earnings Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.seller.earnings')}
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            0 <span className="text-lg font-normal text-gray-500">JOD</span>
                        </p>
                        <p className="text-gray-500 text-sm mt-1">this month</p>
                    </div>

                    {/* Analytics Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.seller.analytics')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-purple-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">views today</p>
                    </div>
                </div>

                {/* Add Product CTA */}
                <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">
                                Start selling on JordanMarket
                            </h3>
                            <p className="mt-1 text-white/80">
                                Add your first product and reach thousands of buyers
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-white/90 transition-colors">
                            {t('dashboard.seller.addProduct')}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
