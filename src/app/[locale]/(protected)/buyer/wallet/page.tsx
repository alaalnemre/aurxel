import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { WalletRedeemForm } from '@/components/buyer/wallet-redeem';

interface BuyerWalletPageProps {
    params: Promise<{ locale: string }>;
}

export default async function BuyerWalletPage({ params }: BuyerWalletPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get wallet (maybeSingle to handle new users without wallet yet)
    const { data: wallet } = await supabase
        .from('wallet_accounts')
        .select('id, balance')
        .eq('owner_id', user!.id)
        .maybeSingle();

    // Get recent transactions
    const { data: transactions } = wallet ? await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('account_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(10) : { data: null };

    const t = {
        title: locale === 'ar' ? 'المحفظة' : 'Wallet',
        balance: locale === 'ar' ? 'الرصيد الحالي' : 'Current Balance',
        recentActivity: locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity',
        noTransactions: locale === 'ar' ? 'لا توجد معاملات بعد' : 'No transactions yet',
        noWallet: locale === 'ar' ? 'لم يتم إنشاء المحفظة بعد' : 'Wallet not created yet',
    };

    const creditTypes = ['topup', 'refund', 'sale_credit', 'delivery_fee'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">{t.balance}</p>
                            <p className="text-4xl font-bold mt-1">
                                {wallet?.balance ? Number(wallet.balance).toFixed(2) : '0.00'}
                                <span className="text-lg font-normal ml-2">QANZ</span>
                            </p>
                        </div>
                        <Wallet className="h-12 w-12 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Top Up Section */}
            <WalletRedeemForm locale={locale} />

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                    {!wallet ? (
                        <p className="text-center text-muted-foreground py-8">{t.noWallet}</p>
                    ) : !transactions || transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">{t.noTransactions}</p>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx) => {
                                const isCredit = creditTypes.includes(tx.type);
                                return (
                                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-full p-2 ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {isCredit ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{tx.type.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(tx.created_at).toLocaleDateString(locale)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isCredit ? '+' : '-'}{Math.abs(Number(tx.amount)).toFixed(2)} QANZ
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
