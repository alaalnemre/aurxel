import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getQanzBalance, getLedgerHistory } from '@/lib/qanz/actions';
import { getRewardsThisMonth } from '@/lib/qanz/rewards';
import { getProfile } from '@/lib/auth/get-profile';
import { RedeemCodeForm } from '@/components/wallet/RedeemCodeForm';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function WalletPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth check - wallet accessible to ALL authenticated users
    const { user } = await getProfile();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const [balance, history, rewardsThisMonth] = await Promise.all([
        getQanzBalance(),
        getLedgerHistory(),
        getRewardsThisMonth(),
    ]);

    return <WalletContent balance={balance} history={history} rewardsThisMonth={rewardsThisMonth} locale={locale} />;
}

function WalletContent({
    balance,
    history,
    rewardsThisMonth,
    locale,
}: {
    balance: number;
    history: Awaited<ReturnType<typeof getLedgerHistory>>;
    rewardsThisMonth: number;
    locale: string;
}) {
    const t = useTranslations();

    const typeColors: Record<string, string> = {
        topup: 'text-green-600',
        spend: 'text-red-600',
        refund: 'text-blue-600',
        admin_adjustment: 'text-purple-600',
        reward: 'text-amber-600',
    };

    const typeIcons: Record<string, string> = {
        topup: '↑',
        spend: '↓',
        refund: '↺',
        admin_adjustment: '⚙',
        reward: '🎁',
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-6">
                    <p className="text-indigo-200 text-sm mb-1">{t('wallet.yourBalance')}</p>
                    <div className="text-5xl font-bold mb-2">
                        {balance.toFixed(2)}
                        <span className="text-2xl ml-2">QANZ</span>
                    </div>
                    <p className="text-indigo-200 text-sm">{t('wallet.qanzDescription')}</p>

                    {/* Rewards This Month */}
                    {rewardsThisMonth > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-indigo-200 text-sm">
                                🎁 {t('wallet.rewardsThisMonth')}: <span className="font-semibold text-white">+{rewardsThisMonth.toFixed(2)} QANZ</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Redeem Code Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('wallet.redeemCode')}
                    </h2>
                    <RedeemCodeForm />
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('wallet.transactionHistory')}
                        </h2>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                💳
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t('wallet.noTransactions')}
                            </h3>
                            <p className="text-gray-500">{t('wallet.noTransactionsDesc')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${entry.amount >= 0
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                                }`}
                                        >
                                            {typeIcons[entry.type] || '•'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {t(`wallet.type.${entry.type}`)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {entry.description || t(`wallet.typeDesc.${entry.type}`)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {entry.amount >= 0 ? '+' : ''}
                                            {entry.amount.toFixed(2)} QANZ
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(entry.created_at).toLocaleDateString(locale)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
