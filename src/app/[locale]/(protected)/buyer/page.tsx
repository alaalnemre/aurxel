import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getProfileBadges, evaluateBuyerBadges } from '@/actions/badges';

export const runtime = 'nodejs';

export default async function BuyerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Evaluate badges on visit
    await evaluateBuyerBadges(profile.id);

    // Get badges
    const { data: badges } = await getProfileBadges(profile.id);

    // Get buyer's orders for analytics
    const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('buyer_profile_id', profile.id)
        .order('created_at', { ascending: false });

    // Get wallet balance
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance_jod, coins')
        .eq('profile_id', profile.id)
        .maybeSingle();

    // Calculate analytics
    const totalOrders = orders?.length || 0;
    const lifetimeSpend = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

    // Monthly spend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo) || [];
    const monthlySpend = monthlyOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // Average order value
    const avgOrderValue = totalOrders > 0 ? lifetimeSpend / totalOrders : 0;

    // Last order
    const lastOrder = orders?.[0];

    // Completed orders for insights
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <PageHeader
                    title={`${t('buyer.welcome')}, ${profile.full_name || t('common.guest')}`}
                    description={t('buyer.dashboardSubtitle')}
                />

                {/* Badges Section */}
                {badges && badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                className="group relative flex items-center gap-1.5 bg-white border border-primary/20 rounded-full px-3 py-1 shadow-sm hover:border-primary transition-all cursor-help"
                                title={locale === 'ar' ? badge.descriptionAr : badge.descriptionEn}
                            >
                                <span className="text-lg">{badge.icon}</span>
                                <span className="text-xs font-bold text-primary whitespace-nowrap">
                                    {locale === 'ar' ? badge.titleAr : badge.titleEn}
                                </span>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-dark text-white text-[10px] rounded shadow-xl z-50 text-center">
                                    {locale === 'ar' ? badge.descriptionAr : badge.descriptionEn}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-top-dark"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title={t('buyer.totalOrders')}
                    value={totalOrders}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('buyer.lifetimeSpend')}
                    value={`${lifetimeSpend.toFixed(2)} ${t('common.currency')}`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('buyer.monthlySpend')}
                    value={`${monthlySpend.toFixed(2)} ${t('common.currency')}`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('buyer.avgOrderValue')}
                    value={`${avgOrderValue.toFixed(2)} ${t('common.currency')}`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
            </div>

            {/* Wallet Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold opacity-90">{t('buyer.walletBalance')}</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold mb-1">{(wallet?.balance_jod || 0).toFixed(2)} {t('common.currency')}</p>
                    <p className="text-sm opacity-80">{wallet?.coins || 0} {t('buyer.coins')}</p>
                </div>

                {/* Last Order Status */}
                <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">{t('buyer.lastOrderStatus')}</h3>
                    {lastOrder ? (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">#{lastOrder.id.slice(0, 8)}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${lastOrder.status === 'completed' ? 'bg-success-soft text-success' :
                                    lastOrder.status === 'cancelled' ? 'bg-error-soft text-error' :
                                        'bg-primary-soft text-primary'
                                    }`}>
                                    {t(`orders.statuses.${lastOrder.status}`)}
                                </span>
                            </div>
                            <p className="text-lg font-bold text-dark">{Number(lastOrder.total).toFixed(2)} {t('common.currency')}</p>
                            <Link href={`/${locale}/orders/${lastOrder.id}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                                {t('orders.viewOrder')} →
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 mb-2">{t('buyer.noOrders')}</p>
                            <Link href={`/${locale}/store`}>
                                <Button size="sm">{t('buyer.startShopping')}</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">{t('buyer.quickActions')}</h3>
                    <div className="space-y-3">
                        <Link href={`/${locale}/orders`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-soft transition-colors">
                            <span className="text-sm font-medium">{t('nav.orders')}</span>
                            <svg className="w-4 h-4 text-gray-400 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href={`/${locale}/store`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-soft transition-colors">
                            <span className="text-sm font-medium">{t('nav.store')}</span>
                            <svg className="w-4 h-4 text-gray-400 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href={`/${locale}/buyer/analytics`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-soft transition-colors">
                            <span className="text-sm font-medium">{t('buyer.viewAnalytics')}</span>
                            <svg className="w-4 h-4 text-gray-400 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-border shadow-card">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark">{t('buyer.recentOrders')}</h3>
                    <Link href={`/${locale}/orders`} className="text-sm text-primary hover:underline">
                        {t('common.viewAll')}
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {orders && orders.length > 0 ? (
                        orders.slice(0, 5).map(order => (
                            <Link key={order.id} href={`/${locale}/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
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
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-gray-400">{t('buyer.noOrdersYet')}</p>
                            <Link href={`/${locale}/store`}>
                                <Button className="mt-4">{t('buyer.startShopping')}</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
