import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';

interface BuyerWalletPageProps {
    params: Promise<{ locale: string }>;
}

export default async function BuyerWalletPage({ params }: BuyerWalletPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get wallet
    const { data: wallet } = await supabase
        .from('wallet_accounts')
        .select('id, balance')
        .eq('owner_id', user!.id)
        .single();

    // Get recent transactions
    const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('account_id', wallet?.id || '')
        .order('created_at', { ascending: false })
        .limit(10);

    const t = {
        title: locale === 'ar' ? 'المحفظة' : 'Wallet',
        balance: locale === 'ar' ? 'الرصيد الحالي' : 'Current Balance',
        topUp: locale === 'ar' ? 'شحن الرصيد' : 'Top Up',
        redeemCode: locale === 'ar' ? 'استخدام كود' : 'Redeem Code',
        codePlaceholder: locale === 'ar' ? 'أدخل الكود هنا' : 'Enter code here',
        redeem: locale === 'ar' ? 'تطبيق' : 'Apply',
        recentActivity: locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity',
        noTransactions: locale === 'ar' ? 'لا توجد معاملات بعد' : 'No transactions yet',
        transactionTypes: {
            topup: locale === 'ar' ? 'شحن' : 'Top up',
            purchase: locale === 'ar' ? 'شراء' : 'Purchase',
            refund: locale === 'ar' ? 'استرداد' : 'Refund',
        },
    };

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
                                {wallet?.balance?.toFixed(2) || '0.00'}
                                <span className="text-lg font-normal ml-2">QANZ</span>
                            </p>
                        </div>
                        <Wallet className="h-12 w-12 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Top Up Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t.redeemCode}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex gap-2">
                        <Input placeholder={t.codePlaceholder} className="flex-1" />
                        <Button type="submit">{t.redeem}</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                    {!transactions || transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">{t.noTransactions}</p>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx) => {
                                const isCredit = ['topup', 'refund', 'sale_credit', 'delivery_fee'].includes(tx.type);
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
