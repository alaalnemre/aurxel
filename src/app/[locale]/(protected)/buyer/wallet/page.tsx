import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { RedeemCodeForm } from '@/components/wallet/RedeemCodeForm';

export default async function BuyerWalletPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('qanz');
    const tBuyer = await getTranslations('buyer');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    // Get transactions
    const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet?.id)
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{tBuyer('wallet')}</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">💎</span>
                    <span className="text-lg opacity-90">{t('title')}</span>
                </div>
                <p className="text-4xl font-bold mb-1">
                    {wallet?.balance?.toFixed(2) || '0.00'}
                </p>
                <p className="opacity-75">QANZ</p>
            </div>

            {/* Redeem Code */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">{t('redeemCode')}</h2>
                <RedeemCodeForm locale={locale} walletId={wallet?.id} />
            </div>

            {/* Transactions */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">{t('history')}</h2>

                {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between py-3 border-b border-border last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'topup' ? 'bg-success/10 text-success' :
                                            tx.type === 'refund' ? 'bg-warning/10 text-warning' :
                                                'bg-error/10 text-error'
                                        }`}>
                                        {tx.type === 'topup' ? '↓' : tx.type === 'refund' ? '↩' : '↑'}
                                    </div>
                                    <div>
                                        <p className="font-medium capitalize">{tx.type}</p>
                                        <p className="text-sm text-secondary">
                                            {new Date(tx.created_at).toLocaleDateString(
                                                locale === 'ar' ? 'ar-JO' : 'en-JO'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'topup' || tx.type === 'refund' ? 'text-success' : 'text-error'
                                    }`}>
                                    {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'}
                                    {Math.abs(tx.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-secondary">
                        <span className="text-4xl block mb-2">💳</span>
                        {t('noTransactions')}
                    </div>
                )}
            </div>
        </div>
    );
}
