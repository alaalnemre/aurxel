import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Truck, TrendingUp } from 'lucide-react';

interface DriverEarningsPageProps {
    params: Promise<{ locale: string }>;
}

// Force dynamic rendering - required for auth cookies
export const dynamic = 'force-dynamic';

export default async function DriverEarningsPage({ params }: DriverEarningsPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    let walletBalance = 0;
    let completedCount: number | null = 0;
    let totalCodCollected = 0;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[DriverEarnings] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[DriverEarnings] No user found');
            return <div className="p-6">Loading...</div>;
        }

        // Get driver
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driverError) {
            console.error('[DriverEarnings] Driver fetch error:', driverError.message);
        }

        // Get wallet
        const { data: wallet, error: walletError } = await supabase
            .from('wallet_accounts')
            .select('balance')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (walletError) {
            console.error('[DriverEarnings] Wallet fetch error:', walletError.message);
        }
        walletBalance = wallet?.balance ? Number(wallet.balance) : 0;

        // Get completed deliveries count
        const { count, error: countError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver?.id || '')
            .eq('status', 'delivered');

        if (countError) {
            console.error('[DriverEarnings] Completed count error:', countError.message);
        }
        completedCount = count;

        // Get COD collected
        const { data: deliveredOrders, error: codError } = await supabase
            .from('deliveries')
            .select('cod_amount')
            .eq('driver_id', driver?.id || '')
            .eq('status', 'delivered');

        if (codError) {
            console.error('[DriverEarnings] COD fetch error:', codError.message);
        }
        totalCodCollected = deliveredOrders?.reduce((sum, d) => sum + Number(d.cod_amount), 0) || 0;

    } catch (error) {
        console.error('[DriverEarnings] Unhandled error:', error);
    }


    const t = {
        title: locale === 'ar' ? 'الأرباح' : 'Earnings',
        walletBalance: locale === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance',
        totalDeliveries: locale === 'ar' ? 'إجمالي التوصيلات' : 'Total Deliveries',
        codCollected: locale === 'ar' ? 'المبالغ المحصلة' : 'COD Collected',
        recentEarnings: locale === 'ar' ? 'الأرباح الأخيرة' : 'Recent Earnings',
        noEarnings: locale === 'ar' ? 'لا توجد أرباح بعد' : 'No earnings yet',
        noEarningsDesc: locale === 'ar'
            ? 'أكمل التوصيلات لتبدأ بكسب المال'
            : 'Complete deliveries to start earning',
        fromDeliveries: locale === 'ar' ? 'من رسوم التوصيل' : 'from delivery fees',
        thisMonth: locale === 'ar' ? 'هذا الشهر' : 'this month',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">{t.walletBalance}</CardTitle>
                        <DollarSign className="h-4 w-4 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{walletBalance.toFixed(2)} JOD</div>
                        <p className="text-xs opacity-75 mt-1">{t.fromDeliveries}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t.totalDeliveries}</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount || 0}</div>
                        <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t.codCollected}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCodCollected.toFixed(2)} JOD</div>
                        <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Earnings */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.recentEarnings}</CardTitle>
                </CardHeader>
                <CardContent>
                    {(completedCount || 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t.noEarnings}</h3>
                            <p className="text-muted-foreground text-sm">{t.noEarningsDesc}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            {locale === 'ar' ? 'سجل الأرباح قادم قريباً' : 'Earnings history coming soon'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
