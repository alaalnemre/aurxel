import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { evaluateDriverBadges, getProfileBadges } from '@/actions/badges';

export const runtime = 'nodejs';

export default async function DriverDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.driver_verified) {
        redirect(`/${locale}/become-driver`);
    }

    const supabase = await createClient();
    const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!driver) redirect(`/${locale}/become-driver`);

    // Evaluate badges
    await evaluateDriverBadges(profile.id);

    // Get badges
    const { data: badges } = await getProfileBadges(profile.id);

    // Get deliveries
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select(`
            id,
            status,
            assigned_at,
            picked_up_at,
            delivered_at,
            created_at,
            orders!inner(id, total, delivery_fee, address, city)
        `)
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

    // Get available deliveries
    const { data: availableDeliveries } = await supabase
        .from('deliveries')
        .select('id')
        .eq('status', 'available');

    // Get wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance_jod, coins')
        .eq('profile_id', profile.id)
        .maybeSingle();

    // Calculate stats
    const completedDeliveries = deliveries?.filter(d => d.status === 'delivered') || [];
    const totalDeliveries = completedDeliveries.length;
    const activeDeliveries = deliveries?.filter(d => ['assigned', 'picked_up'].includes(d.status)).length || 0;
    const available = availableDeliveries?.length || 0;

    // Calculate earnings (delivery fees from completed deliveries)
    const totalEarnings = completedDeliveries.reduce((sum, d) => {
        const orderData = d.orders as unknown as { delivery_fee: number } | null;
        return sum + (orderData?.delivery_fee || 0);
    }, 0);

    // Today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDeliveries = completedDeliveries.filter(d => d.delivered_at && new Date(d.delivered_at) >= today);
    const todayEarnings = todayDeliveries.reduce((sum, d) => {
        const orderData = d.orders as unknown as { delivery_fee: number } | null;
        return sum + (orderData?.delivery_fee || 0);
    }, 0);

    // Average delivery time (for completed deliveries with all timestamps)
    const deliveriesWithTime = completedDeliveries.filter(d => d.assigned_at && d.delivered_at);
    let avgMinutes = 0;
    if (deliveriesWithTime.length >= 2) {
        const totalMinutes = deliveriesWithTime.reduce((sum, d) => {
            const start = new Date(d.assigned_at!).getTime();
            const end = new Date(d.delivered_at!).getTime();
            return sum + (end - start) / (1000 * 60);
        }, 0);
        avgMinutes = Math.round(totalMinutes / deliveriesWithTime.length);
    }

    // Navigation tabs
    const navItems = [
        { href: `/${locale}/driver`, label: t('driver.overview'), active: true },
        { href: `/${locale}/driver/deliveries`, label: t('driver.myDeliveries') },
        { href: `/${locale}/driver/earnings`, label: t('driver.earningsTab') },
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

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <PageHeader
                        title={t('driver.welcome')}
                        description={t('driver.dashboardSubtitle')}
                        action={<Link href={`/${locale}/driver/deliveries?tab=available`}><Button>{t('driver.viewAvailable')}</Button></Link>}
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
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-dark"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Primary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t('driver.completedDeliveries')}
                        value={totalDeliveries}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('driver.totalEarnings')}
                        value={`${totalEarnings.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('driver.activeNow')}
                        value={activeDeliveries}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('driver.avgDeliveryTime')}
                        value={deliveriesWithTime.length >= 2 ? `${avgMinutes} min` : t('driver.notEnoughData')}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Secondary Info Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Earnings */}
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold opacity-90">{t('driver.todayEarnings')}</h3>
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold mb-1">{todayEarnings.toFixed(2)} {t('common.currency')}</p>
                        <p className="text-sm opacity-80">{todayDeliveries.length} {t('driver.deliveriesToday')}</p>
                    </div>

                    {/* Wallet Balance */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('driver.walletBalance')}</h3>
                        <p className="text-2xl font-bold text-success mb-2">{(wallet?.balance_jod || 0).toFixed(2)} {t('common.currency')}</p>
                        <p className="text-xs text-gray-400 mb-4">{t('driver.walletHint')}</p>
                        <Link href={`/${locale}/driver/earnings`} className="text-sm text-primary hover:underline">
                            {t('driver.viewEarnings')} →
                        </Link>
                    </div>

                    {/* Available Deliveries */}
                    <div className="bg-white rounded-xl p-6 border border-border shadow-card">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('driver.availableDeliveries')}</h3>
                        <p className="text-4xl font-bold text-primary mb-2">{available}</p>
                        <Link href={`/${locale}/driver/deliveries?tab=available`}>
                            <Button variant="outline" className="w-full mt-2">
                                {t('driver.browseAvailable')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-xl border border-border shadow-card">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-dark">{t('driver.recentActivity')}</h3>
                        <Link href={`/${locale}/driver/deliveries?tab=my`} className="text-sm text-primary hover:underline">
                            {t('common.viewAll')}
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {completedDeliveries.length > 0 ? (
                            completedDeliveries.slice(0, 5).map(delivery => {
                                const orderData = delivery.orders as unknown as { address: string; city: string; delivery_fee: number } | null;
                                return (
                                    <div key={delivery.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-dark">{orderData?.address}</p>
                                            <p className="text-sm text-gray-500">{orderData?.city}</p>
                                            <p className="text-xs text-gray-400">{delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleDateString() : ''}</p>
                                        </div>
                                        <span className="font-bold text-success">+{(orderData?.delivery_fee || 0).toFixed(2)}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 mb-2">{t('driver.noDeliveriesYet')}</p>
                                <p className="text-sm text-gray-500">{t('driver.noDeliveriesHint')}</p>
                                <Link href={`/${locale}/driver/deliveries?tab=available`}>
                                    <Button className="mt-4">{t('driver.viewAvailable')}</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
