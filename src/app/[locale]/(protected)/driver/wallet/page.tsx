import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { RedeemCodeForm } from '@/components/wallet/RedeemCodeForm';

export default async function DriverWalletPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('qanz');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get or create wallet
    let { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    if (!wallet && user) {
        const { data: newWallet } = await supabase
            .from('wallets')
            .insert({ user_id: user.id, balance: 0 })
            .select('id, balance')
            .maybeSingle();
        wallet = newWallet;
    }

    // Get transactions
    const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet?.id)
        .order('created_at', { ascending: false })
        .limit(20);

    // Get delivery earnings
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select('cash_collected')
        .eq('driver_id', user?.id)
        .eq('status', 'delivered');

    const totalCashCollected = deliveries?.reduce((sum, d) => sum + Number(d.cash_collected || 0), 0) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{locale === 'ar' ? 'المحفظة' : 'Wallet'}</h1>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QANZ Balance */}
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

                {/* Cash Collected */}
                <div className="bg-gradient-to-br from-warning to-orange-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">💵</span>
                        <span className="text-lg opacity-90">{locale === 'ar' ? 'نقد محصّل' : 'Cash Collected'}</span>
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {totalCashCollected.toFixed(2)}
                    </p>
                    <p className="opacity-75">JOD</p>
                </div>
            </div>

            {/* Redeem Code */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">{t('redeemCode')}</h2>
                <RedeemCodeForm locale={locale} walletId={wallet?.id} />
            </div>

            {/* Note about cash */}
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                <p className="text-sm text-warning">
                    {locale === 'ar'
                        ? '💡 النقد المحصّل يجب تسليمه للمنصة. أرباحك هي رسوم التوصيل فقط.'
                        : '💡 Cash collected must be handed over to the platform. Your earnings are the delivery fees only.'}
                </p>
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
                                            {new Date(tx.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
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
