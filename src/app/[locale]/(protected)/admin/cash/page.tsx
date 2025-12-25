import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getPendingCashCollections, getAllCashCollections } from '@/lib/cash/actions';
import { AdminCashCard } from '@/components/admin/AdminCashCard';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminCashPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [pendingCollections, allCollections] = await Promise.all([
        getPendingCashCollections(),
        getAllCashCollections(),
    ]);

    return (
        <AdminCashContent
            pendingCollections={pendingCollections}
            allCollections={allCollections}
            locale={locale}
        />
    );
}

function AdminCashContent({
    pendingCollections,
    allCollections,
    locale,
}: {
    pendingCollections: Awaited<ReturnType<typeof getPendingCashCollections>>;
    allCollections: Awaited<ReturnType<typeof getAllCashCollections>>;
    locale: string;
}) {
    const t = useTranslations();

    const pendingAmount = allCollections
        .filter((c) => c.status === 'pending')
        .reduce((sum, c) => sum + Number(c.amount_expected), 0);
    const collectedAmount = allCollections
        .filter((c) => c.status === 'collected')
        .reduce((sum, c) => sum + Number(c.amount_collected || 0), 0);
    const confirmedAmount = allCollections
        .filter((c) => c.status === 'confirmed')
        .reduce((sum, c) => sum + Number(c.amount_collected || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('cash.adminCash')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('cash.adminCashDesc')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.pendingWithDrivers')}</div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {pendingAmount.toFixed(2)} JOD
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.awaitingConfirmation')}</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {collectedAmount.toFixed(2)} JOD
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                    <div className="text-sm text-gray-500">{t('cash.confirmed')}</div>
                    <div className="text-2xl font-bold text-green-600">
                        {confirmedAmount.toFixed(2)} JOD
                    </div>
                </div>
            </div>

            {/* Pending Collections */}
            {pendingCollections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('cash.allClear')}
                    </h3>
                    <p className="text-gray-500">{t('cash.noPendingCash')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {t('cash.pendingConfirmation')} ({pendingCollections.length})
                    </h2>
                    <div className="space-y-3">
                        {pendingCollections.map((collection) => (
                            <AdminCashCard
                                key={collection.id}
                                collection={collection}
                                locale={locale}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
