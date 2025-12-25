import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllCodes } from '@/lib/qanz/actions';
import { VoidCodeButton } from '@/components/admin/VoidCodeButton';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminQanzCodesPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ status?: string }>;
}) {
    const { locale } = await params;
    const { status } = await searchParams;
    setRequestLocale(locale);

    const statusFilter = status as 'active' | 'redeemed' | 'voided' | undefined;
    const codes = await getAllCodes(statusFilter);

    return <CodesContent codes={codes} statusFilter={statusFilter} locale={locale} />;
}

function CodesContent({
    codes,
    statusFilter,
    locale,
}: {
    codes: Awaited<ReturnType<typeof getAllCodes>>;
    statusFilter?: string;
    locale: string;
}) {
    const t = useTranslations();

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        redeemed: 'bg-blue-100 text-blue-700',
        voided: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/qanz"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
                    >
                        ← {t('common.back')}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{t('qanz.allCodes')}</h1>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <Link
                    href="/admin/qanz/codes"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${!statusFilter
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('qanz.allStatus')}
                </Link>
                <Link
                    href="/admin/qanz/codes?status=active"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${statusFilter === 'active'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('qanz.statusActive')}
                </Link>
                <Link
                    href="/admin/qanz/codes?status=redeemed"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${statusFilter === 'redeemed'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('qanz.statusRedeemed')}
                </Link>
                <Link
                    href="/admin/qanz/codes?status=voided"
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${statusFilter === 'voided'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('qanz.statusVoided')}
                </Link>
            </div>

            {/* Codes Table */}
            {codes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        🎫
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('qanz.noCodes')}
                    </h3>
                    <p className="text-gray-500">{t('qanz.noCodesDesc')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.code')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.amount')}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.status')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.createdAt')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.redeemedBy')}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {t('qanz.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {codes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {code.code}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {code.amount.toFixed(2)} QANZ
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[code.status]
                                                    }`}
                                            >
                                                {t(`qanz.status${code.status.charAt(0).toUpperCase() + code.status.slice(1)}`)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(code.created_at).toLocaleDateString(locale)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {code.redeemer?.full_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {code.status === 'active' && (
                                                <VoidCodeButton codeId={code.id} />
                                            )}
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
