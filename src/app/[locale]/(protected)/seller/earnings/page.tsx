import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getSellerSettlements, getSellerEarningsSummary } from '@/lib/settlements/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SellerEarningsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [settlements, summary] = await Promise.all([
        getSellerSettlements(),
        getSellerEarningsSummary(),
    ]);

    return <EarningsContent settlements={settlements} summary={summary} locale={locale} />;
}

function EarningsContent({
    settlements,
    summary,
    locale,
}: {
    settlements: Awaited<ReturnType<typeof getSellerSettlements>>;
    summary: Awaited<ReturnType<typeof getSellerEarningsSummary>>;
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
                <h1 className="text-2xl font-bold text-gray-900">{t('earnings.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('earnings.description')}</p>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">{t('earnings.totalOrders')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {summary.totalOrders}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
                        <div className="text-sm text-gray-500">{t('earnings.totalRevenue')}</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {summary.totalRevenue.toFixed(2)} JOD
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
                        <div className="text-sm text-gray-500">{t('earnings.pendingPayout')}</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {summary.pendingAmount.toFixed(2)} JOD
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                        <div className="text-sm text-gray-500">{t('earnings.totalEarnings')}</div>
                        <div className="text-2xl font-bold text-green-600">
                            {summary.totalEarnings.toFixed(2)} JOD
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdown Card */}
            {summary && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('earnings.breakdown')}
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">{t('earnings.grossRevenue')}</span>
                            <span className="font-semibold text-gray-900">
                                {summary.totalRevenue.toFixed(2)} JOD
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">{t('earnings.platformFees')}</span>
                            <span className="font-semibold text-red-600">
                                -{summary.totalFees.toFixed(2)} JOD
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-lg">
                            <span className="font-semibold text-gray-900">{t('earnings.netEarnings')}</span>
                            <span className="font-bold text-green-600">
                                {summary.totalEarnings.toFixed(2)} JOD
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Settlements List */}
            {settlements.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        💰
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('earnings.noEarnings')}
                    </h3>
                    <p className="text-gray-500">{t('earnings.noEarningsDesc')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('earnings.orderHistory')}
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {settlements.map((settlement) => (
                            <div
                                key={settlement.id}
                                className="p-4 flex items-center justify-between hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        #{settlement.order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(settlement.created_at).toLocaleDateString(locale)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        +{settlement.seller_amount.toFixed(2)} JOD
                                    </p>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[settlement.status]
                                            }`}
                                    >
                                        {t(`settlements.statusLabel.${settlement.status}`)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
