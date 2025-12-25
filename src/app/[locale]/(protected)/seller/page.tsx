import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

interface SellerDashboardProps {
    params: Promise<{ locale: string }>;
}

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function SellerDashboard({ params }: SellerDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    let seller: { id: string; business_name: string | null } | null = null;
    let productsCount: number | null = 0;
    let ordersCount: number | null = 0;
    let pendingCount = 0;

    try {
        const supabase = await createClient();

        // Use getUser() for proper JWT validation on Vercel edge runtime
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[SellerDashboard] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[SellerDashboard] No session found');
            return <div className="p-6">Loading...</div>;
        }

        // Get seller info
        const { data: sellerData, error: sellerError } = await supabase
            .from('sellers')
            .select('id, business_name')
            .eq('user_id', user.id)
            .maybeSingle();

        if (sellerError) {
            console.error('[SellerDashboard] Seller fetch error:', sellerError.message);
        }

        if (!sellerData) {
            return <div className="p-6">Loading seller data...</div>;
        }
        seller = sellerData;

        // Get products count
        const { count: prodCount, error: prodError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', seller.id);

        if (prodError) {
            console.error('[SellerDashboard] Products count error:', prodError.message);
        }
        productsCount = prodCount;

        // Get orders count for this seller
        const { count: ordCount, error: ordError } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', seller.id);

        if (ordError) {
            console.error('[SellerDashboard] Orders count error:', ordError.message);
        }
        ordersCount = ordCount;

        // Get pending orders
        const { data: pendingOrders, error: pendingError } = await supabase
            .from('order_items')
            .select('order_id, orders!inner(status)')
            .eq('seller_id', seller.id)
            .eq('orders.status', 'pending_seller');

        if (pendingError) {
            console.error('[SellerDashboard] Pending orders error:', pendingError.message);
        }
        pendingCount = pendingOrders?.length || 0;

    } catch (error) {
        console.error('[SellerDashboard] Unhandled error:', error);
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        {locale === 'ar' ? 'لوحة تحكم البائع' : 'Seller Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        {locale === 'ar' ? 'جاري تحميل البيانات...' : 'Loading your data...'}
                    </p>
                </div>
            </div>
        );
    }

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
