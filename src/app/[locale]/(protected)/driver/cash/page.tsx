import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getDriverCashCollections } from '@/lib/cash/actions';
import { CashCollectionCard } from '@/components/driver/CashCollectionCard';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DriverCashPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const collections = await getDriverCashCollections();

    return <DriverCashContent collections={collections} locale={locale} />;
}

function DriverCashContent({
    collections,
    locale,
}: {
    collections: Awaited<ReturnType<typeof getDriverCashCollections>>;
    locale: string;
}) {
    const t = useTranslations();

    const pendingCollections = collections.filter((c) => c.status === 'pending');
    const collectedCollections = collections.filter((c) => c.status === 'collected');
    const confirmedCollections = collections.filter((c) => c.status === 'confirmed');

    const pendingAmount = pendingCollections.reduce(
        (sum, c) => sum + Number(c.amount_expected),
        0
    );
    const collectedAmount = collectedCollections.reduce(
        (sum, c) => sum + Number(c.amount_collected || c.amount_expected),
        0
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('cash.driverCash')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('cash.manageCash')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.pendingCollection')}</div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {pendingAmount.toFixed(2)} JOD
                    </div>
                    <div className="text-xs text-gray-400">
                        {pendingCollections.length} {t('cash.deliveries')}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.awaitingConfirmation')}</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {collectedAmount.toFixed(2)} JOD
                    </div>
                    <div className="text-xs text-gray-400">
                        {collectedCollections.length} {t('cash.deliveries')}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.confirmed')}</div>
                    <div className="text-2xl font-bold text-green-600">
                        {confirmedCollections.length}
                    </div>
                    <div className="text-xs text-gray-400">{t('cash.totalConfirmed')}</div>
                </div>
            </div>

            {collections.length === 0 ? (
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
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('cash.noCollections')}
                    </h3>
                    <p className="text-gray-500">{t('cash.noCollectionsDesc')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pending Section */}
                    {pendingCollections.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('cash.pendingCollection')}
                            </h2>
                            <div className="space-y-3">
                                {pendingCollections.map((collection) => (
                                    <CashCollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collected Section */}
                    {collectedCollections.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('cash.awaitingConfirmation')}
                            </h2>
                            <div className="space-y-3">
                                {collectedCollections.map((collection) => (
                                    <CashCollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirmed Section */}
                    {confirmedCollections.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('cash.confirmed')}
                            </h2>
                            <div className="space-y-3">
                                {confirmedCollections.slice(0, 5).map((collection) => (
                                    <CashCollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
