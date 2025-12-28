import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';

export const runtime = 'nodejs';

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/store`);
    }

    const supabase = await createClient();

    // User counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: sellerCount } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'approved');

    // Pending approvals
    const { count: pendingSellers } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: openDisputes } = await supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating']);

    // Orders and revenue
    const { data: orders } = await supabase.from('orders').select('id, total, status, created_at');
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders?.length || 0;

    // Commission data (platform revenue)
    const { data: commissions } = await supabase
        .from('order_commissions')
        .select('commission_amount, platform_revenue, is_settled');

    const platformRevenue = commissions?.reduce((sum, c) => sum + Number(c.platform_revenue), 0) || 0;
    const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

    // Pending payouts
    const { data: pendingPayouts } = await supabase
        .from('payouts')
        .select('amount')
        .in('status', ['pending', 'processing']);
    const pendingPayoutTotal = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
    const todayRevenue = todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0);

    // Navigation tabs
    const navItems = [
        { href: `/${locale}/admin`, label: t('admin.overview'), active: true },
        { href: `/${locale}/admin/approvals`, label: t('admin.approvals') },
        { href: `/${locale}/admin/users`, label: t('admin.users') },
        { href: `/${locale}/admin/disputes`, label: t('admin.disputes') },
        { href: `/${locale}/admin/analytics`, label: t('admin.analyticsTab') },
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
                    title={t('admin.welcome')}
                    description={t('admin.dashboardSubtitle')}
                />

                {/* Primary KPIs - Platform Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t('admin.platformRevenue')}
                        value={`${platformRevenue.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('admin.totalCommissions')}
                        value={`${totalCommissions.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('admin.totalOrderVolume')}
                        value={`${totalRevenue.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('admin.totalOrders')}
                        value={totalOrders}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                </div>

                {/* Secondary Info Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Stats */}
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold opacity-90">{t('admin.todayStats')}</h3>
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold mb-1">{todayRevenue.toFixed(2)} {t('common.currency')}</p>
                        <p className="text-sm opacity-80">{todayOrders.length} {t('admin.ordersToday')}</p>
                    </div>

                    {/* Pending Payouts */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('admin.pendingPayoutsTotal')}</h3>
                        <p className="text-2xl font-bold text-warning mb-2">{pendingPayoutTotal.toFixed(2)} {t('common.currency')}</p>
                        <p className="text-xs text-gray-400 mb-4">{pendingPayouts?.length || 0} {t('admin.payoutRequests')}</p>
                    </div>

                    {/* User Growth */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('admin.userStats')}</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('admin.totalUsers')}</span>
                                <span className="font-bold">{userCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('admin.totalSellers')}</span>
                                <span className="font-bold text-primary">{sellerCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('admin.totalDrivers')}</span>
                                <span className="font-bold text-info">{driverCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href={`/${locale}/admin/approvals`} className="bg-white rounded-xl p-6 border border-border shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-dark">{t('admin.approvals')}</h3>
                            {((pendingSellers || 0) + (pendingDrivers || 0)) > 0 && (
                                <span className="px-3 py-1 bg-warning text-white text-sm font-bold rounded-full">
                                    {(pendingSellers || 0) + (pendingDrivers || 0)}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500">{pendingSellers || 0} {t('admin.sellersPending')}, {pendingDrivers || 0} {t('admin.driversPending')}</p>
                    </Link>

                    <Link href={`/${locale}/admin/disputes`} className="bg-white rounded-xl p-6 border border-border shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-dark">{t('admin.disputes')}</h3>
                            {(openDisputes || 0) > 0 && (
                                <span className="px-3 py-1 bg-error text-white text-sm font-bold rounded-full">
                                    {openDisputes}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500">{openDisputes || 0} {t('admin.openDisputes')}</p>
                    </Link>

                    <Link href={`/${locale}/admin/analytics`} className="bg-white rounded-xl p-6 border border-border shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-dark">{t('admin.analytics')}</h3>
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500">{t('admin.viewDetailedAnalytics')}</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
