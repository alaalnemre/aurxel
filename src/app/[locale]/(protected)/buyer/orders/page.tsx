import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Package, Clock, CheckCircle } from 'lucide-react';

interface BuyerOrdersPageProps {
    params: Promise<{ locale: string }>;
}

export default async function BuyerOrdersPage({ params }: BuyerOrdersPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    let orders: Array<{ id: string; status: string; total: number; created_at: string }> | null = null;

    try {
        const supabase = await createClient();

        // Use getUser() for proper JWT validation on Vercel edge runtime
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[BuyerOrders] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[BuyerOrders] No session found');
            return <div className="p-6">Loading...</div>;
        }

        // Get orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (ordersError) {
            console.error('[BuyerOrders] Orders fetch error:', ordersError.message);
        }
        orders = ordersData;

    } catch (error) {
        console.error('[BuyerOrders] Unhandled error:', error);
    }


    const t = {
        title: locale === 'ar' ? 'طلباتي' : 'My Orders',
        noOrders: locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet',
        noOrdersDesc: locale === 'ar'
            ? 'عندما تقوم بإجراء طلب، سيظهر هنا'
            : 'When you place an order, it will appear here',
        shopNow: locale === 'ar' ? 'تسوق الآن' : 'Shop Now',
        status: {
            pending_seller: locale === 'ar' ? 'بانتظار البائع' : 'Pending',
            preparing: locale === 'ar' ? 'قيد التحضير' : 'Preparing',
            ready_for_pickup: locale === 'ar' ? 'جاهز للاستلام' : 'Ready',
            completed: locale === 'ar' ? 'مكتمل' : 'Completed',
        },
    };

    const statusIcons = {
        pending_seller: Clock,
        preparing: Package,
        ready_for_pickup: Package,
        completed: CheckCircle,
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.noOrders}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{t.noOrdersDesc}</p>
                        <Link
                            href={`/${locale}/buyer/shop`}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            {t.shopNow}
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
                    const statusLabel = t.status[order.status as keyof typeof t.status] || order.status;

                    return (
                        <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-muted p-2">
                                            <StatusIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {locale === 'ar' ? 'طلب' : 'Order'} #{order.id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString(locale)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{Number(order.total).toFixed(2)} JOD</p>
                                        <p className="text-sm text-muted-foreground">{statusLabel}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
