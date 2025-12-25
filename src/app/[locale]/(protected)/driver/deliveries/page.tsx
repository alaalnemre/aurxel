import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAvailableDeliveries, getDriverDeliveries } from '@/lib/deliveries/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DriverDeliveriesPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale } = await params;
    const { tab } = await searchParams;
    setRequestLocale(locale);

    const activeTab = tab || 'available';

    const [availableDeliveries, myDeliveries] = await Promise.all([
        getAvailableDeliveries(),
        getDriverDeliveries(),
    ]);

    return (
        <DriverDeliveriesContent
            availableDeliveries={availableDeliveries}
            myDeliveries={myDeliveries}
            activeTab={activeTab}
            locale={locale}
        />
    );
}

function DriverDeliveriesContent({
    availableDeliveries,
    myDeliveries,
    activeTab,
    locale,
}: {
    availableDeliveries: Awaited<ReturnType<typeof getAvailableDeliveries>>;
    myDeliveries: Awaited<ReturnType<typeof getDriverDeliveries>>;
    activeTab: string;
    locale: string;
}) {
    const t = useTranslations();

    const statusColors: Record<string, string> = {
        available: 'bg-green-100 text-green-700',
        assigned: 'bg-blue-100 text-blue-700',
        picked_up: 'bg-yellow-100 text-yellow-700',
        delivered: 'bg-purple-100 text-purple-700',
    };

    const activeDeliveries = myDeliveries.filter(
        (d) => d.status !== 'delivered'
    );
    const completedDeliveries = myDeliveries.filter(
        (d) => d.status === 'delivered'
    );

    const deliveriesToShow =
        activeTab === 'available'
            ? availableDeliveries
            : activeTab === 'active'
                ? activeDeliveries
                : completedDeliveries;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('delivery.driverDeliveries')}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {t('delivery.manageDeliveries')}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('delivery.available')}</div>
                    <div className="text-2xl font-bold text-green-600">
                        {availableDeliveries.length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('delivery.active')}</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {activeDeliveries.length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('delivery.completed')}</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {completedDeliveries.length}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <Link
                    href="/driver/deliveries?tab=available"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'available'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('delivery.availableTab')} ({availableDeliveries.length})
                </Link>
                <Link
                    href="/driver/deliveries?tab=active"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'active'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('delivery.activeTab')} ({activeDeliveries.length})
                </Link>
                <Link
                    href="/driver/deliveries?tab=completed"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'completed'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('delivery.completedTab')} ({completedDeliveries.length})
                </Link>
            </div>

            {/* Deliveries List */}
            {deliveriesToShow.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === 'available'
                            ? t('delivery.noAvailable')
                            : activeTab === 'active'
                                ? t('delivery.noActive')
                                : t('delivery.noCompleted')}
                    </h3>
                    <p className="text-gray-500">
                        {activeTab === 'available'
                            ? t('delivery.noAvailableDesc')
                            : activeTab === 'active'
                                ? t('delivery.noActiveDesc')
                                : t('delivery.noCompletedDesc')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deliveriesToShow.map((delivery) => (
                        <Link
                            key={delivery.id}
                            href={`/driver/deliveries/${delivery.id}`}
                            className={`block bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${delivery.status === 'available'
                                    ? 'border-green-300 bg-green-50/30'
                                    : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.orderId')}: #
                                        {delivery.order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(delivery.created_at).toLocaleString(locale)}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[delivery.status]
                                        }`}
                                >
                                    {t(`delivery.status.${delivery.status}`)}
                                </span>
                            </div>

                            {delivery.order && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>📍</span>
                                        <span className="truncate">
                                            {delivery.order.delivery_address || t('delivery.noAddress')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            {delivery.order.items?.length || 0} {t('orders.items')}
                                        </span>
                                        <span className="text-lg font-bold text-indigo-600">
                                            {delivery.order.total_amount?.toFixed(2)} JOD
                                        </span>
                                    </div>
                                </div>
                            )}

                            {delivery.status === 'available' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-sm text-green-600 font-medium">
                                        {t('delivery.clickToAccept')} →
                                    </span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
