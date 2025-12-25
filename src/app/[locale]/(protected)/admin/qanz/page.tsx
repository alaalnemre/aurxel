import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getQanzStats, getOutstandingLiability } from '@/lib/qanz/actions';
import { GenerateCodesForm } from '@/components/admin/GenerateCodesForm';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminQanzPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [stats, liability] = await Promise.all([
        getQanzStats(),
        getOutstandingLiability(),
    ]);

    return <AdminQanzContent stats={stats} liability={liability} locale={locale} />;
}

function AdminQanzContent({
    stats,
    liability,
    locale,
}: {
    stats: Awaited<ReturnType<typeof getQanzStats>>;
    liability: number;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('qanz.adminTitle')}</h1>
                    <p className="mt-1 text-sm text-gray-500">{t('qanz.adminDescription')}</p>
                </div>
                <Link
                    href="/admin/qanz/codes"
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                    {t('qanz.viewAllCodes')}
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.totalCodes')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalCodesGenerated}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.activeCodes')}</div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.activeCodes}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.redeemedCodes')}</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.redeemedCodes}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.voidedCodes')}</div>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.voidedCodes}
                        </div>
                    </div>
                </div>
            )}

            {/* Financial Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.outstandingLiability')}</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {liability.toFixed(2)} QANZ
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('qanz.liabilityNote')}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.totalRedeemed')}</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {stats.totalRedeemed.toFixed(2)} QANZ
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4">
                        <div className="text-sm text-gray-500">{t('qanz.inCirculation')}</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.totalInCirculation.toFixed(2)} QANZ
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Codes Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('qanz.generateCodes')}
                </h2>
                <GenerateCodesForm />
            </div>
        </div>
    );
}
