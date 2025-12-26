import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function DriverDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('driver');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch driver profile
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

    // Fetch wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    // Delivery stats
    const { count: availableDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

    const { count: activeDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .in('status', ['assigned', 'picked_up']);

    const { count: totalDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'delivered');

    const { data: completedDeliveries } = await supabase
        .from('deliveries')
        .select('cash_collected, delivered_at, order_id')
        .eq('driver_id', user?.id)
        .eq('status', 'delivered');

    const totalCashCollected = completedDeliveries?.reduce(
        (sum, d) => sum + (Number(d.cash_collected) || 0),
        0
    ) || 0;

    // Get delivery fees (earnings)
    const orderIds = completedDeliveries?.map(d => d.order_id).filter(Boolean) || [];
    const { data: orders } = orderIds.length > 0
        ? await supabase.from('orders').select('delivery_fee').in('id', orderIds)
        : { data: [] };

    const totalEarnings = orders?.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0) || 0;

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const { count: todayDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'delivered')
        .gte('delivered_at', today);

    const todayDelivered = completedDeliveries?.filter(d => d.delivered_at?.startsWith(today)) || [];
    const todayOrderIds = todayDelivered.map(d => d.order_id).filter(Boolean);
    const { data: todayOrders } = todayOrderIds.length > 0
        ? await supabase.from('orders').select('delivery_fee').in('id', todayOrderIds)
        : { data: [] };
    const todayEarnings = todayOrders?.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0) || 0;

    // This week stats
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: weekDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'delivered')
        .gte('delivered_at', startOfWeek.toISOString());

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
                    <p className="text-secondary">
                        {driverProfile?.vehicle_type === 'motorcycle' && '🏍️'}
                        {driverProfile?.vehicle_type === 'car' && '🚗'}
                        {driverProfile?.vehicle_type === 'van' && '🚚'}
                        {' '}
                        {locale === 'ar' ? 'سائق توصيل' : 'Delivery Driver'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {driverProfile?.is_verified ? (
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${driverProfile.is_available
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-secondary'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${driverProfile.is_available ? 'bg-success animate-pulse' : 'bg-secondary'}`} />
                            {driverProfile.is_available
                                ? (locale === 'ar' ? 'متاح' : 'Online')
                                : (locale === 'ar' ? 'غير متاح' : 'Offline')}
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-full">
                            ⏳ {locale === 'ar' ? 'بانتظار التوثيق' : 'Pending Verification'}
                        </span>
                    )}
                </div>
            </div>

            {/* Earnings Overview */}
            <div className="bg-gradient-to-br from-warning to-orange-500 rounded-2xl p-6 text-white">
                <h2 className="text-lg opacity-90 mb-4">💰 {locale === 'ar' ? 'ملخص الأرباح' : 'Earnings Summary'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{todayEarnings.toFixed(0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'أرباح اليوم' : 'Today'} (JOD)</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalEarnings.toFixed(0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'} (JOD)</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{wallet?.balance?.toFixed(0) || 0}</p>
                        <p className="text-sm opacity-75">💎 QANZ</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalCashCollected.toFixed(0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'نقد محصّل' : 'Cash Collected'} (JOD)</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                    icon="🚚"
                    label={locale === 'ar' ? 'متاح الآن' : 'Available'}
                    value={availableDeliveries || 0}
                    color="primary"
                    highlight={availableDeliveries ? availableDeliveries > 0 : false}
                />
                <StatCard icon="📦" label={locale === 'ar' ? 'نشط' : 'Active'} value={activeDeliveries || 0} color="warning" />
                <StatCard icon="✅" label={locale === 'ar' ? 'اليوم' : 'Today'} value={todayDeliveries || 0} color="success" />
                <StatCard icon="📅" label={locale === 'ar' ? 'هذا الأسبوع' : 'This Week'} value={weekDeliveries || 0} color="accent" />
                <StatCard icon="🏆" label={locale === 'ar' ? 'إجمالي' : 'Total'} value={totalDeliveries || 0} />
                <StatCard icon="⭐" label={locale === 'ar' ? 'التقييم' : 'Rating'} value={4.8} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    href={`/${locale}/driver/deliveries?tab=available`}
                    icon="🚚"
                    label={locale === 'ar' ? 'التوصيلات المتاحة' : 'Available'}
                    primary
                    badge={availableDeliveries}
                />
                <QuickAction
                    href={`/${locale}/driver/deliveries?tab=active`}
                    icon="📦"
                    label={locale === 'ar' ? 'التوصيلات النشطة' : 'Active'}
                    badge={activeDeliveries}
                />
                <QuickAction href={`/${locale}/driver/earnings`} icon="💰" label={t('earnings')} />
                <QuickAction href={`/${locale}/driver/wallet`} icon="💎" label={locale === 'ar' ? 'المحفظة' : 'Wallet'} />
            </div>

            {/* Performance & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">📊 {locale === 'ar' ? 'الأداء' : 'Performance'}</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-secondary">{locale === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}</span>
                            <span className="font-bold text-success">100%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-secondary">{locale === 'ar' ? 'متوسط وقت التوصيل' : 'Avg. Delivery Time'}</span>
                            <span className="font-bold">~25 {locale === 'ar' ? 'دقيقة' : 'min'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-secondary">{locale === 'ar' ? 'تقييم العملاء' : 'Customer Rating'}</span>
                            <span className="font-bold">⭐ 4.8/5</span>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">💡 {locale === 'ar' ? 'نصائح' : 'Tips'}</h2>
                    <div className="space-y-3 text-sm text-secondary">
                        <p>✓ {locale === 'ar' ? 'ابقَ متاحًا في أوقات الذروة لزيادة الأرباح' : 'Stay online during peak hours for more earnings'}</p>
                        <p>✓ {locale === 'ar' ? 'تأكد من تحصيل المبلغ الصحيح' : 'Always verify the correct amount before collecting'}</p>
                        <p>✓ {locale === 'ar' ? 'حافظ على تقييمك العالي' : 'Maintain a high rating for priority deliveries'}</p>
                    </div>
                </div>
            </div>

            {/* Verification Notice */}
            {!driverProfile?.is_verified && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-warning mb-2">
                        ⚠️ {locale === 'ar' ? 'التحقق مطلوب' : 'Verification Required'}
                    </h2>
                    <p className="text-secondary mb-4">
                        {locale === 'ar'
                            ? 'يرجى الانتظار حتى يتم التحقق من حسابك لبدء استلام التوصيلات'
                            : 'Please wait for your account to be verified before you can start accepting deliveries'}
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color, highlight }: { icon: string; label: string; value: number; color?: string; highlight?: boolean }) {
    return (
        <div className={`bg-card rounded-xl p-4 shadow-card relative ${highlight ? 'ring-2 ring-success' : ''}`}>
            {highlight && <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />}
            <div className="text-xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-secondary">{label}</p>
        </div>
    );
}

function QuickAction({ href, icon, label, primary, badge }: { href: string; icon: string; label: string; primary?: boolean; badge?: number | null }) {
    return (
        <Link
            href={href}
            className={`rounded-xl p-5 text-center transition-all group relative ${primary ? 'bg-success text-white hover:bg-green-600' : 'bg-card shadow-card hover:shadow-card-hover'
                }`}
        >
            {badge && badge > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-warning text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                    {badge}
                </span>
            )}
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
