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

export default async function BuyerDashboard({
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

    return <BuyerDashboardContent user={user} balance={balance} unreadCount={unreadCount} />;
}

function BuyerDashboardContent({ user, balance, unreadCount }: { user: { email?: string } | null; balance: number; unreadCount: number }) {
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
                            <span className="ml-4 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
                                Buyer
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
                        {t('dashboard.buyer.title')}
                    </h1>
                    <p className="mt-2 text-gray-600">{t('dashboard.buyer.welcome')}</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Recent Orders Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.buyer.recentOrders')}
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {t('dashboard.buyer.noOrders')}
                        </p>
                        <Link
                            href="/"
                            className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {t('dashboard.buyer.browseProducts')}
                            <svg
                                className="ml-1 w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>

                    {/* Saved Items Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.buyer.savedItems')}
                            </h2>
                            <svg
                                className="w-6 h-6 text-pink-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-500 text-sm mt-1">items saved</p>
                    </div>

                    {/* Wallet Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('dashboard.buyer.wallet')}
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
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            0 <span className="text-lg font-normal text-gray-500">QANZ</span>
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Available balance</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
