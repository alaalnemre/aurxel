import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getAllSettlements, getSettlementStats } from '@/lib/settlements/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminSettlementsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [settlements, stats] = await Promise.all([
        getAllSettlements(),
        getSettlementStats(),
    ]);

    return <SettlementsContent settlements={settlements} stats={stats} locale={locale} />;
}

function SettlementsContent({
    settlements,
    stats,
    locale,
}: {
    settlements: Awaited<ReturnType<typeof getAllSettlements>>;
    stats: Awaited<ReturnType<typeof getSettlementStats>>;
    locale: string;
}) {
    const t = useTranslations();

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        paid: 'bg-green-100 text-green-700',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('settlements.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('settlements.description')}</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">{t('settlements.totalRevenue')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalRevenue.toFixed(2)} JOD
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
                        <div className="text-sm text-gray-500">{t('settlements.platformFees')}</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {stats.totalPlatformFees.toFixed(2)} JOD
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
                        <div className="text-sm text-gray-500">{t('settlements.driverFees')}</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.totalDriverFees.toFixed(2)} JOD
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                        <div className="text-sm text-gray-500">{t('settlements.sellerEarnings')}</div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.totalSellerEarnings.toFixed(2)} JOD
                        </div>
                    </div>
                </div>
            )}

            {/* Settlements Table */}
            {settlements.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        💰
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('settlements.noSettlements')}
                    </h3>
                    <p className="text-gray-500">{t('settlements.noSettlementsDesc')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('orders.orderId')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('settlements.seller')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('settlements.driver')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        {t('settlements.orderAmount')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        {t('settlements.sellerAmount')}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {t('settlements.status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {settlements.map((settlement) => (
                                    <tr key={settlement.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                #{settlement.order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                {new Date(settlement.created_at).toLocaleDateString(locale)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {settlement.seller?.full_name || 'Seller'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {settlement.driver?.full_name || 'Driver'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                            {settlement.order_amount.toFixed(2)} JOD
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                                            {settlement.seller_amount.toFixed(2)} JOD
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[settlement.status]
                                                    }`}
                                            >
                                                {t(`settlements.statusLabel.${settlement.status}`)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
