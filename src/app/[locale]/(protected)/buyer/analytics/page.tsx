import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/StatusBadge';

export const runtime = 'nodejs';

export default async function BuyerAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get all orders with seller info
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id,
            total,
            status,
            created_at,
            seller_id,
            sellers!inner(id, store_name)
        `)
        .eq('buyer_profile_id', profile.id)
        .order('created_at', { ascending: false });

    // Get order items with category info
    const orderIds = orders?.map(o => o.id) || [];
    const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
            order_id,
            quantity,
            line_total,
            product_id,
            products(category)
        `)
        .in('order_id', orderIds.length > 0 ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    // Calculate Top Stores by Spend
    const storeSpend: Record<string, { name: string; spend: number; orders: number }> = {};
    orders?.forEach(order => {
        const sellerId = order.seller_id;
        const sellerData = order.sellers as unknown as { store_name: string } | null;
        const storeName = sellerData?.store_name || 'Unknown';

        if (!storeSpend[sellerId]) {
            storeSpend[sellerId] = { name: storeName, spend: 0, orders: 0 };
        }
        storeSpend[sellerId].spend += Number(order.total);
        storeSpend[sellerId].orders += 1;
    });

    const topStoresBySpend = Object.entries(storeSpend)
        .sort((a, b) => b[1].spend - a[1].spend)
        .slice(0, 5);

    const topStoresByOrders = Object.entries(storeSpend)
        .sort((a, b) => b[1].orders - a[1].orders)
        .slice(0, 5);

    // Calculate Most Purchased Categories
    const categoryCount: Record<string, { count: number; spend: number }> = {};
    orderItems?.forEach(item => {
        const productData = item.products as unknown as { category: string | null } | null;
        const category = productData?.category || 'Uncategorized';
        if (!categoryCount[category]) {
            categoryCount[category] = { count: 0, spend: 0 };
        }
        categoryCount[category].count += item.quantity;
        categoryCount[category].spend += Number(item.line_total);
    });

    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1].spend - a[1].spend)
        .slice(0, 5);

    // Purchase frequency
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const totalOrders = orders?.length || 0;

    // Orders per month (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; orders: number; spend: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthOrders = orders?.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= monthStart && orderDate <= monthEnd;
        }) || [];
        monthlyData.push({
            month: monthStart.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', { month: 'short' }),
            orders: monthOrders.length,
            spend: monthOrders.reduce((sum, o) => sum + Number(o.total), 0)
        });
    }

    return (
        <div>
            <PageHeader
                title={t('buyer.analyticsTitle')}
                description={t('buyer.analyticsSubtitle')}
            />

            {/* Top Stores Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* By Spend */}
                <div className="bg-white rounded-xl border border-border shadow-card">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold text-dark">{t('buyer.topStoresBySpend')}</h3>
                    </div>
                    <div className="p-6">
                        {topStoresBySpend.length > 0 ? (
                            <div className="space-y-4">
                                {topStoresBySpend.map(([id, store], index) => (
                                    <div key={id} className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-primary-soft text-primary text-sm font-bold flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-dark">{store.name}</p>
                                            <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${(store.spend / (topStoresBySpend[0]?.[1].spend || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="font-bold text-dark">{store.spend.toFixed(2)} {t('common.currency')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">{t('buyer.noDataYet')}</p>
                        )}
                    </div>
                </div>

                {/* By Order Count */}
                <div className="bg-white rounded-xl border border-border shadow-card">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold text-dark">{t('buyer.topStoresByOrders')}</h3>
                    </div>
                    <div className="p-6">
                        {topStoresByOrders.length > 0 ? (
                            <div className="space-y-4">
                                {topStoresByOrders.map(([id, store], index) => (
                                    <div key={id} className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-info-soft text-info text-sm font-bold flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-dark">{store.name}</p>
                                            <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-info h-2 rounded-full transition-all"
                                                    style={{ width: `${(store.orders / (topStoresByOrders[0]?.[1].orders || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="font-bold text-dark">{store.orders} {t('buyer.ordersLabel')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">{t('buyer.noDataYet')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-xl border border-border shadow-card mb-8">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-dark">{t('buyer.topCategories')}</h3>
                </div>
                <div className="p-6">
                    {topCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {topCategories.map(([category, data], index) => (
                                <div key={category} className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-warning-soft text-warning mx-auto mb-3 flex items-center justify-center text-lg font-bold">
                                        {index + 1}
                                    </div>
                                    <p className="font-medium text-dark mb-1">{category}</p>
                                    <p className="text-sm text-gray-500">{data.count} {t('buyer.items')}</p>
                                    <p className="text-sm font-semibold text-primary">{data.spend.toFixed(2)} {t('common.currency')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">{t('buyer.noDataYet')}</p>
                    )}
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl border border-border shadow-card">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-dark">{t('buyer.monthlyTrend')}</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-6 gap-4">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="text-center">
                                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-hover transition-all"
                                        style={{
                                            height: `${Math.max(10, (data.spend / Math.max(...monthlyData.map(m => m.spend), 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">{data.month}</p>
                                <p className="text-sm font-bold text-dark">{data.orders}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">{t('buyer.totalOrdersAnalytics')}</p>
                            <p className="text-2xl font-bold text-dark">{totalOrders}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">{t('buyer.completionRate')}</p>
                            <p className="text-2xl font-bold text-success">
                                {totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
