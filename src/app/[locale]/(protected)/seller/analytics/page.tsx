import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function SellerAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) {
        redirect(`/${locale}/become-seller`);
    }

    const supabase = await createClient();

    const { data: seller } = await supabase
        .from('sellers')
        .select('id, store_name')
        .eq('profile_id', profile.id)
        .maybeSingle();

    if (!seller) redirect(`/${locale}/become-seller`);

    // Get all orders with items
    const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    // Get order items with product info
    const orderIds = orders?.map(o => o.id) || [];
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, title_snapshot, quantity, line_total, product_id')
        .in('order_id', orderIds.length > 0 ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    // Get products with stock info
    const { data: products } = await supabase
        .from('products')
        .select('id, title, stock, is_active, category')
        .eq('seller_id', seller.id);

    // Calculate top products
    const productSales: Record<string, { title: string; quantity: number; revenue: number }> = {};
    orderItems?.forEach(item => {
        const key = item.product_id || item.title_snapshot;
        if (!productSales[key]) {
            productSales[key] = { title: item.title_snapshot, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += Number(item.line_total);
    });

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);

    // Monthly revenue trend (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; orders: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthOrders = orders?.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= monthStart && orderDate <= monthEnd && o.status === 'completed';
        }) || [];
        monthlyData.push({
            month: monthStart.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', { month: 'short' }),
            orders: monthOrders.length,
            revenue: monthOrders.reduce((sum, o) => sum + Number(o.total), 0)
        });
    }

    // Order status distribution
    const statusCounts: Record<string, number> = {};
    orders?.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Low stock products
    const lowStockProducts = products?.filter(p => p.is_active && p.stock < 10).slice(0, 5) || [];

    // Category distribution
    const categorySales: Record<string, number> = {};
    products?.forEach(p => {
        const category = p.category || 'Uncategorized';
        categorySales[category] = (categorySales[category] || 0) + 1;
    });

    const navItems = [
        { href: `/${locale}/seller`, label: t('seller.overview') },
        { href: `/${locale}/seller/orders`, label: t('seller.orders') },
        { href: `/${locale}/seller/products`, label: t('seller.products') },
        { href: `/${locale}/seller/analytics`, label: t('seller.analyticsTab'), active: true },
        { href: `/${locale}/seller/finance`, label: t('seller.financeTab') },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <nav className="mb-8 border-b border-border">
                    <div className="flex flex-wrap gap-1 -mb-px">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${item.active
                                        ? 'text-primary border-primary'
                                        : 'text-gray-500 border-transparent hover:text-primary hover:border-primary'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <PageHeader
                    title={t('seller.analyticsTitle')}
                    description={t('seller.analyticsSubtitle')}
                />

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-border shadow-card mb-8">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold text-dark">{t('seller.revenueTrend')}</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-6 gap-4">
                            {monthlyData.map((data) => (
                                <div key={data.month} className="text-center">
                                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-hover transition-all"
                                            style={{
                                                height: `${Math.max(10, (data.revenue / Math.max(...monthlyData.map(m => m.revenue), 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{data.month}</p>
                                    <p className="text-sm font-bold text-dark">{data.revenue.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Products */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('seller.topProducts')}</h3>
                        </div>
                        <div className="p-6">
                            {topProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {topProducts.map(([id, product], index) => (
                                        <div key={id} className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-primary-soft text-primary text-sm font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-dark truncate">{product.title}</p>
                                                <p className="text-sm text-gray-500">{product.quantity} {t('seller.sold')}</p>
                                            </div>
                                            <span className="font-bold text-dark">{product.revenue.toFixed(2)} {t('common.currency')}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">{t('buyer.noDataYet')}</p>
                            )}
                        </div>
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('seller.orderStats')}</h3>
                        </div>
                        <div className="p-6">
                            {Object.entries(statusCounts).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(statusCounts).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'completed' ? 'bg-success-soft text-success' :
                                                    status === 'cancelled' ? 'bg-error-soft text-error' :
                                                        'bg-primary-soft text-primary'
                                                }`}>
                                                {t(`orders.statuses.${status}`)}
                                            </span>
                                            <span className="font-bold text-dark">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">{t('buyer.noDataYet')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-warning-soft rounded-xl border border-warning p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-dark mb-2">{t('seller.lowStockAlert')}</h4>
                                <div className="space-y-1">
                                    {lowStockProducts.map(p => (
                                        <p key={p.id} className="text-sm text-gray-600">
                                            <span className="font-medium">{p.title}</span>: {p.stock} {t('seller.remaining')}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
