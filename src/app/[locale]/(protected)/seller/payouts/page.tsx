import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface SellerPayoutsPageProps {
    params: Promise<{ locale: string }>;
}

export default async function SellerPayoutsPage({ params }: SellerPayoutsPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    let totalEarnings = 0;
    let platformFee = 0;
    let netEarnings = 0;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[SellerPayouts] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[SellerPayouts] No user found');
            return <div className="p-6">Loading...</div>;
        }

        // Get seller
        const { data: seller, error: sellerError } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (sellerError) {
            console.error('[SellerPayouts] Seller fetch error:', sellerError.message);
        }

        // Get completed orders
        const { data: orderItems, error: ordersError } = await supabase
            .from('order_items')
            .select('price_snapshot, qty, orders!inner(status)')
            .eq('seller_id', seller?.id || '');

        if (ordersError) {
            console.error('[SellerPayouts] Orders fetch error:', ordersError.message);
        }

        // Calculate earnings
        const completedItems = orderItems?.filter((item) => {
            const order = item.orders as unknown as { status: string };
            return order.status === 'completed';
        }) || [];

        totalEarnings = completedItems.reduce((sum, item) =>
            sum + (Number(item.price_snapshot) * item.qty), 0
        );

        platformFee = totalEarnings * 0.1; // 10% platform fee
        netEarnings = totalEarnings - platformFee;

    } catch (error) {
        console.error('[SellerPayouts] Unhandled error:', error);
    }

    const t = {
        title: locale === 'ar' ? 'الأرباح والمدفوعات' : 'Earnings & Payouts',
        totalSales: locale === 'ar' ? 'إجمالي المبيعات' : 'Total Sales',
        platformFee: locale === 'ar' ? 'رسوم المنصة (10%)' : 'Platform Fee (10%)',
        netEarnings: locale === 'ar' ? 'صافي الأرباح' : 'Net Earnings',
        pendingPayout: locale === 'ar' ? 'في انتظار الصرف' : 'Pending Payout',
        recentPayouts: locale === 'ar' ? 'المدفوعات الأخيرة' : 'Recent Payouts',
        noPayouts: locale === 'ar' ? 'لا توجد مدفوعات بعد' : 'No payouts yet',
        noPayoutsDesc: locale === 'ar'
            ? 'عندما تكمل الطلبات، ستظهر مدفوعاتك هنا'
            : 'When orders are completed, your payouts will appear here',
        fromCompletedOrders: locale === 'ar' ? 'من الطلبات المكتملة' : 'from completed orders',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t.totalSales}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEarnings.toFixed(2)} JOD</div>
                        <p className="text-xs text-muted-foreground">{t.fromCompletedOrders}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">{t.platformFee}</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-{platformFee.toFixed(2)} JOD</div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">{t.netEarnings}</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{netEarnings.toFixed(2)} JOD</div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">{t.pendingPayout}</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{netEarnings.toFixed(2)} JOD</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payouts */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.recentPayouts}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.noPayouts}</h3>
                        <p className="text-muted-foreground text-sm">{t.noPayoutsDesc}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
