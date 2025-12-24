import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderActions } from '@/components/seller/order-actions';

interface SellerOrdersPageProps {
    params: Promise<{ locale: string }>;
}

export default async function SellerOrdersPage({ params }: SellerOrdersPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    // Get orders with items from this seller
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, orders!inner(*), products(title_en, title_ar)')
        .eq('seller_id', seller?.id || '')
        .order('created_at', { ascending: false });

    // Group by order
    const ordersMap = new Map();
    orderItems?.forEach(item => {
        const order = item.orders as { id: string; created_at: string; status: string; total: number };
        if (order && !ordersMap.has(order.id)) {
            ordersMap.set(order.id, { ...order, items: [] });
        }
        if (order) {
            ordersMap.get(order.id).items.push(item);
        }
    });
    const orders = Array.from(ordersMap.values());

    const newOrders = orders.filter(o => o.status === 'pending_seller');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready_for_pickup');
    const completedOrders = orders.filter(o => o.status === 'completed');

    const t = {
        title: locale === 'ar' ? 'الطلبات' : 'Orders',
        new: locale === 'ar' ? 'جديدة' : 'New',
        preparing: locale === 'ar' ? 'قيد التحضير' : 'Preparing',
        ready: locale === 'ar' ? 'جاهزة' : 'Ready',
        completed: locale === 'ar' ? 'مكتملة' : 'Completed',
        noOrders: locale === 'ar' ? 'لا توجد طلبات' : 'No orders',
        items: locale === 'ar' ? 'عناصر' : 'items',
        total: locale === 'ar' ? 'الإجمالي' : 'Total',
    };

    const renderOrders = (orderList: typeof orders) => {
        if (orderList.length === 0) {
            return (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {t.noOrders}
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {orderList.map((order) => (
                    <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-medium">
                                        {locale === 'ar' ? 'طلب' : 'Order'} #{order.id.slice(0, 8)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString(locale)} • {order.items.length} {t.items}
                                    </p>
                                </div>
                                <Badge variant={order.status === 'pending_seller' ? 'destructive' : 'default'}>
                                    {order.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>

                            {/* Order items */}
                            <div className="space-y-1 mb-3 text-sm">
                                {order.items.slice(0, 3).map((item: { id: string; qty: number; products: { title_en?: string; title_ar?: string } }) => (
                                    <div key={item.id} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {item.qty}x {locale === 'ar' ? item.products?.title_ar : item.products?.title_en}
                                        </span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-muted-foreground">+{order.items.length - 3} more</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t pt-3">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">{t.total}: </span>
                                    <span className="font-semibold">{Number(order.total).toFixed(2)} JOD</span>
                                </div>
                                <OrderActions orderId={order.id} status={order.status} locale={locale} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            <Tabs defaultValue="new" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="new" className="relative">
                        {t.new}
                        {newOrders.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                                {newOrders.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="preparing">{t.preparing}</TabsTrigger>
                    <TabsTrigger value="ready">{t.ready}</TabsTrigger>
                    <TabsTrigger value="completed">{t.completed}</TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="mt-4">
                    {renderOrders(newOrders)}
                </TabsContent>
                <TabsContent value="preparing" className="mt-4">
                    {renderOrders(preparingOrders)}
                </TabsContent>
                <TabsContent value="ready" className="mt-4">
                    {renderOrders(readyOrders)}
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                    {renderOrders(completedOrders)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
