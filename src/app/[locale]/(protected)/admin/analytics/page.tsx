import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function AdminAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/store`);
    }

    const supabase = await createClient();

    // Get all orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at, seller_id')
        .order('created_at', { ascending: false });

    // Get commissions
    const { data: commissions } = await supabase
        .from('order_commissions')
        .select('order_total, commission_amount, platform_revenue, seller_earnings, is_settled, created_at');

    // Get sellers with commissions
    const { data: sellers } = await supabase
        .from('sellers')
        .select('id, store_name, commission_rate');

    // Monthly revenue trend
    const now = new Date();
    const monthlyData: { month: string; revenue: number; commissions: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthCommissions = commissions?.filter(c => {
            const date = new Date(c.created_at);
            return date >= monthStart && date <= monthEnd;
        }) || [];
        const monthOrders = orders?.filter(o => {
            const date = new Date(o.created_at);
            return date >= monthStart && date <= monthEnd;
        }) || [];

        monthlyData.push({
            month: monthStart.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', { month: 'short' }),
            revenue: monthCommissions.reduce((sum, c) => sum + Number(c.order_total), 0),
            commissions: monthCommissions.reduce((sum, c) => sum + Number(c.platform_revenue), 0),
            orders: monthOrders.length
        });
    }

    // Top sellers by revenue
    const sellerRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    orders?.forEach(o => {
        if (o.status === 'completed') {
            const seller = sellers?.find(s => s.id === o.seller_id);
            if (seller) {
                if (!sellerRevenue[o.seller_id]) {
                    sellerRevenue[o.seller_id] = { name: seller.store_name, revenue: 0, orders: 0 };
                }
                sellerRevenue[o.seller_id].revenue += Number(o.total);
                sellerRevenue[o.seller_id].orders += 1;
            }
        }
    });

    const topSellers = Object.entries(sellerRevenue)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10);

    // Order status distribution
    const statusCounts: Record<string, number> = {};
    orders?.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Settlement stats
    const totalUnsettled = commissions?.filter(c => !c.is_settled).reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;
    const totalSettled = commissions?.filter(c => c.is_settled).reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;

    const navItems = [
        { href: `/${locale}/admin`, label: t('admin.overview') },
        { href: `/${locale}/admin/approvals`, label: t('admin.approvals') },
        { href: `/${locale}/admin/users`, label: t('admin.users') },
        { href: `/${locale}/admin/disputes`, label: t('admin.disputes') },
        { href: `/${locale}/admin/analytics`, label: t('admin.analyticsTab'), active: true },
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
                    title={t('admin.analyticsTitle')}
                    description={t('admin.analyticsSubtitle')}
                />

                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl border border-border shadow-card mb-8">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold text-dark">{t('admin.revenueTrend')}</h3>
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
                                    <p className="text-xs text-gray-400">{data.orders} orders</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Sellers */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('admin.topSellers')}</h3>
                        </div>
                        <div className="p-6 max-h-96 overflow-y-auto">
                            {topSellers.length > 0 ? (
                                <div className="space-y-4">
                                    {topSellers.map(([id, seller], index) => (
                                        <div key={id} className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-primary-soft text-primary text-sm font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-dark truncate">{seller.name}</p>
                                                <p className="text-sm text-gray-500">{seller.orders} orders</p>
                                            </div>
                                            <span className="font-bold text-success">{seller.revenue.toFixed(2)}</span>
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
                            <h3 className="text-lg font-semibold text-dark">{t('admin.orderDistribution')}</h3>
                        </div>
                        <div className="p-6">
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
                        </div>
                    </div>
                </div>

                {/* Settlement Stats */}
                <div className="bg-white rounded-xl border border-border shadow-card p-6">
                    <h3 className="text-lg font-semibold text-dark mb-6">{t('admin.settlementStats')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-success-soft rounded-lg">
                            <p className="text-sm text-success mb-1">{t('admin.settledAmount')}</p>
                            <p className="text-xl font-bold text-success">{totalSettled.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-warning-soft rounded-lg">
                            <p className="text-sm text-warning mb-1">{t('admin.unsettledAmount')}</p>
                            <p className="text-xl font-bold text-warning">{totalUnsettled.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-primary-soft rounded-lg">
                            <p className="text-sm text-primary mb-1">{t('admin.totalCommissionsEarned')}</p>
                            <p className="text-xl font-bold text-primary">
                                {commissions?.reduce((sum, c) => sum + Number(c.platform_revenue), 0).toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('admin.totalTransactions')}</p>
                            <p className="text-xl font-bold text-dark">{commissions?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
