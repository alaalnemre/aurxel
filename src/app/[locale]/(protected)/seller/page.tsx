import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { evaluateSellerBadges, getProfileBadges } from '@/actions/badges';

export const runtime = 'nodejs';

export default async function SellerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) {
        redirect(`/${locale}/become-seller`);
    }

    const supabase = await createClient();

    const { data: seller } = await supabase
        .from('sellers')
        .select('id, store_name, commission_rate')
        .eq('profile_id', profile.id)
        .maybeSingle();

    if (!seller) redirect(`/${locale}/become-seller`);

    // Evaluate badges
    await evaluateSellerBadges(seller.id);

    // Get badges
    const { data: badges } = await getProfileBadges(profile.id);

    // Get products count
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

    const { count: activeProductCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id)
        .eq('is_active', true);

    // Get orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    // Get commission data
    const { data: commissions } = await supabase
        .from('order_commissions')
        .select('order_total, commission_amount, seller_earnings, is_settled')
        .eq('seller_id', seller.id);

    // Calculate KPIs
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const grossRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // Commission-aware calculations
    const totalCommission = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
    const netRevenue = grossRevenue - totalCommission;
    const unsettledEarnings = commissions?.filter(c => !c.is_settled).reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;

    const pendingOrders = orders?.filter(o => ['placed', 'accepted', 'preparing', 'ready_for_pickup'].includes(o.status)).length || 0;
    const activeOrders = orders?.filter(o => ['assigned', 'picked_up'].includes(o.status)).length || 0;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
    const todaySales = todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0);

    // Navigation tabs
    const navItems = [
        { href: `/${locale}/seller`, label: t('seller.overview'), active: true },
        { href: `/${locale}/seller/orders`, label: t('seller.orders') },
        { href: `/${locale}/seller/products`, label: t('seller.products') },
        { href: `/${locale}/seller/analytics`, label: t('seller.analyticsTab') },
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
                    title={`${t('seller.welcome')}, ${seller.store_name}`}
                    description={t('seller.dashboardSubtitle')}
                    action={<Link href={`/${locale}/seller/products/new`}><Button>{t('seller.addProduct')}</Button></Link>}
                />

                {/* Primary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t('seller.grossRevenue')}
                        value={`${grossRevenue.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.netRevenue')}
                        value={`${netRevenue.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.totalOrders')}
                        value={totalOrders}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.activeOrders')}
                        value={pendingOrders + activeOrders}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />
                </div>

                {/* Secondary Info Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Sales */}
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold opacity-90">{t('seller.todaySales')}</h3>
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold mb-1">{todaySales.toFixed(2)} {t('common.currency')}</p>
                        <p className="text-sm opacity-80">{todayOrders.length} {t('seller.ordersToday')}</p>
                    </div>

                    {/* Available Balance */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('seller.availableBalance')}</h3>
                        <p className="text-2xl font-bold text-success mb-2">{unsettledEarnings.toFixed(2)} {t('common.currency')}</p>
                        <p className="text-xs text-gray-400 mb-4">{t('seller.commissionRate')}: {(seller.commission_rate * 100).toFixed(0)}%</p>
                        <Link href={`/${locale}/seller/finance`} className="text-sm text-primary hover:underline">
                            {t('seller.viewFinance')} →
                        </Link>
                    </div>

                    {/* Product Stats */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('seller.productStats')}</h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-600">{t('seller.totalProducts')}</span>
                            <span className="font-bold">{productCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">{t('seller.activeProducts')}</span>
                            <span className="font-bold text-success">{activeProductCount || 0}</span>
                        </div>
                        <Link href={`/${locale}/seller/products`} className="text-sm text-primary hover:underline">
                            {t('seller.manageProducts')} →
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-border shadow-card">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-dark">{t('seller.recentOrders')}</h3>
                        <Link href={`/${locale}/seller/orders`} className="text-sm text-primary hover:underline">
                            {t('common.viewAll')}
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {orders && orders.length > 0 ? (
                            orders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-dark">#{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-end">
                                        <p className="font-medium">{Number(order.total).toFixed(2)} {t('common.currency')}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-success-soft text-success' :
                                            order.status === 'cancelled' ? 'bg-error-soft text-error' :
                                                'bg-primary-soft text-primary'
                                            }`}>
                                            {t(`orders.statuses.${order.status}`)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 mb-4">{t('seller.noOrders')}</p>
                                <p className="text-sm text-gray-500">{t('seller.waitingForOrders')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
