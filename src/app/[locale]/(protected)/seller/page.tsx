import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

interface SellerDashboardProps {
    params: Promise<{ locale: string }>;
}

export default async function SellerDashboard({ params }: SellerDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get seller info
    const { data: seller } = await supabase
        .from('sellers')
        .select('id, business_name')
        .eq('user_id', user!.id)
        .single();

    if (!seller) {
        return <div>Loading...</div>;
    }

    // Get products count
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

    // Get orders count for this seller
    const { count: ordersCount } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

    // Get pending orders
    const { data: pendingOrders } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(status)')
        .eq('seller_id', seller.id)
        .eq('orders.status', 'pending_seller');

    const pendingCount = pendingOrders?.length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    {locale === 'ar' ? `مرحباً، ${seller.business_name}!` : `Welcome, ${seller.business_name}!`}
                </h1>
                <p className="text-muted-foreground">
                    {locale === 'ar' ? 'إليك نظرة عامة على متجرك' : "Here's an overview of your store"}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'المنتجات' : 'Products'}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'منتج في المتجر' : 'products in store'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'الطلبات' : 'Orders'}
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'إجمالي الطلبات' : 'total orders'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={pendingCount > 0 ? 'border-yellow-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'طلبات جديدة' : 'New Orders'}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'بحاجة لاهتمامك' : 'need attention'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'الإيرادات' : 'Revenue'}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.00 JOD</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'هذا الشهر' : 'this month'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Empty state or recent activity */}
            {(productsCount || 0) === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {locale === 'ar' ? 'ابدأ بإضافة منتجاتك' : 'Start by adding your products'}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 text-center">
                            {locale === 'ar'
                                ? 'أضف منتجك الأول لتبدأ البيع على سوق الأردن'
                                : 'Add your first product to start selling on JordanMarket'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
