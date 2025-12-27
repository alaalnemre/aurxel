import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('admin');
    const isRTL = locale === 'ar';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ========================================
    // SECURITY: Admin capability check
    // ========================================
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

        if (!profile?.is_admin) {
            redirect(`/${locale}/buyer`);
        }
    } else {
        redirect(`/${locale}/login`);
    }

    // ========================================
    // DATE CALCULATIONS
    // ========================================
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ========================================
    // FETCH ALL DATA (Parallel queries)
    // ========================================
    const [
        totalOrdersResult,
        completedOrdersResult,
        activeOrdersResult,
        ordersThisMonthResult,
        ordersTodayResult,
        deliveredOrdersData,
        pendingSellersResult,
        pendingDriversResult,
        activeSellersResult,
        activeDriversResult,
        totalDisputesResult,
        openDisputesResult,
        recentOrdersResult,
        newUsersTodayResult,
    ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'in', '(delivered,cancelled)'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('total_amount, delivery_fee, platform_fee, created_at').eq('status', 'delivered'),
        supabase.from('seller_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('orders').select('seller_id').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('deliveries').select('driver_id').eq('status', 'delivered').gte('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('disputes').select('*', { count: 'exact', head: true }),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'under_review']),
        supabase.from('orders').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    ]);

    // ========================================
    // EXTRACT VALUES
    // ========================================
    const totalOrders = totalOrdersResult.count || 0;
    const completedOrders = completedOrdersResult.count || 0;
    const activeOrders = activeOrdersResult.count || 0;
    const ordersThisMonth = ordersThisMonthResult.count || 0;
    const ordersToday = ordersTodayResult.count || 0;
    const pendingSellers = pendingSellersResult.count || 0;
    const pendingDrivers = pendingDriversResult.count || 0;
    const totalDisputes = totalDisputesResult.count || 0;
    const openDisputes = openDisputesResult.count || 0;
    const newUsersToday = newUsersTodayResult.count || 0;
    const recentOrders = recentOrdersResult.data || [];

    // Active users (unique)
    const uniqueActiveSellers = new Set((activeSellersResult.data || []).map(o => o.seller_id).filter(Boolean)).size;
    const uniqueActiveDrivers = new Set((activeDriversResult.data || []).map(d => d.driver_id).filter(Boolean)).size;

    // ========================================
    // REVENUE CALCULATIONS
    // ========================================
    const deliveredOrders = deliveredOrdersData.data || [];

    // Calculate revenue metrics
    const totalGrossSales = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const totalPlatformFees = deliveredOrders.reduce((sum, o) => sum + (Number(o.platform_fee) || 0), 0);

    // Fallback: if platform_fee not yet calculated, estimate at 5%
    const platformRevenue = totalPlatformFees > 0 ? totalPlatformFees : totalGrossSales * 0.05;

    // This month's revenue
    const monthOrders = deliveredOrders.filter(o => new Date(o.created_at) >= monthStart);
    const monthPlatformFees = monthOrders.reduce((sum, o) => sum + (Number(o.platform_fee) || 0), 0);
    const monthGrossSales = monthOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const monthRevenue = monthPlatformFees > 0 ? monthPlatformFees : monthGrossSales * 0.05;

    // Today's revenue
    const todayOrders = deliveredOrders.filter(o => new Date(o.created_at) >= todayStart);
    const todayPlatformFees = todayOrders.reduce((sum, o) => sum + (Number(o.platform_fee) || 0), 0);
    const todayGrossSales = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const todayRevenue = todayPlatformFees > 0 ? todayPlatformFees : todayGrossSales * 0.05;

    const hasRevenue = platformRevenue > 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ========================================
                HEADER
            ======================================== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
                    <p className="text-text-muted text-sm">
                        {isRTL ? 'لوحة التحكم التنفيذية' : 'Executive Overview'}
                    </p>
                </div>
                <div className={`text-${isRTL ? 'left' : 'right'}`}>
                    <p className="text-sm font-medium">
                        {now.toLocaleDateString(isRTL ? 'ar-JO' : 'en-JO', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                        })}
                    </p>
                    <p className="text-xs text-text-muted">
                        {now.toLocaleTimeString(isRTL ? 'ar-JO' : 'en-JO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* ========================================
                PRIMARY KPIs - Revenue Focus (Large Cards)
            ======================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <PrimaryKPI
                    label={isRTL ? 'إيرادات المنصة' : 'Platform Revenue'}
                    value={platformRevenue}
                    context={isRTL ? 'الإجمالي' : 'All Time'}
                    isCurrency
                    variant="success"
                    icon="💰"
                />
                <PrimaryKPI
                    label={isRTL ? 'إيرادات الشهر' : 'This Month'}
                    value={monthRevenue}
                    context={now.toLocaleDateString(isRTL ? 'ar-JO' : 'en-JO', { month: 'short' })}
                    isCurrency
                    variant="success"
                    icon="📅"
                />
                <PrimaryKPI
                    label={isRTL ? 'طلبات مكتملة' : 'Completed Orders'}
                    value={completedOrders}
                    context={isRTL ? 'الإجمالي' : 'All Time'}
                    icon="✅"
                />
                <PrimaryKPI
                    label={isRTL ? 'طلبات نشطة' : 'Active Orders'}
                    value={activeOrders}
                    context={isRTL ? 'الآن' : 'Right Now'}
                    variant={activeOrders > 0 ? 'warning' : 'default'}
                    icon="🚚"
                />
            </div>

            {/* ========================================
                SECONDARY KPIs (Smaller Cards)
            ======================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SecondaryKPI
                    label={isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                    value={totalOrders}
                    icon="📦"
                />
                <SecondaryKPI
                    label={isRTL ? 'بائعين نشطين' : 'Active Sellers'}
                    value={uniqueActiveSellers}
                    icon="🏪"
                    subtitle={isRTL ? 'آخر 30 يوم' : '30 days'}
                />
                <SecondaryKPI
                    label={isRTL ? 'سائقين نشطين' : 'Active Drivers'}
                    value={uniqueActiveDrivers}
                    icon="🛵"
                    subtitle={isRTL ? 'آخر 30 يوم' : '30 days'}
                />
                <SecondaryKPI
                    label={isRTL ? 'نزاعات مفتوحة' : 'Open Disputes'}
                    value={openDisputes}
                    icon="⚠️"
                    variant={openDisputes > 0 ? 'warning' : 'default'}
                />
            </div>

            {/* ========================================
                TODAY'S SNAPSHOT + ACTIONS
            ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Summary */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold">
                            {isRTL ? '📊 اليوم' : '📊 Today'}
                        </h2>
                        <span className="text-xs text-text-muted bg-bg-muted px-2 py-1 rounded-full">
                            {now.toLocaleDateString(isRTL ? 'ar-JO' : 'en-JO', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-accent-soft rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-accent">{ordersToday}</p>
                            <p className="text-xs text-text-muted">{isRTL ? 'طلبات جديدة' : 'New Orders'}</p>
                        </div>
                        <div className="bg-success-soft rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-success">{todayRevenue.toFixed(2)}</p>
                            <p className="text-xs text-text-muted">JOD {isRTL ? 'إيرادات' : 'Revenue'}</p>
                        </div>
                        <div className="bg-bg-muted rounded-xl p-3 text-center">
                            <p className="text-xl font-bold">{newUsersToday}</p>
                            <p className="text-xs text-text-muted">{isRTL ? 'مستخدم جديد' : 'New Users'}</p>
                        </div>
                        <div className="bg-bg-muted rounded-xl p-3 text-center">
                            <p className="text-xl font-bold">{todayGrossSales.toFixed(0)}</p>
                            <p className="text-xs text-text-muted">JOD {isRTL ? 'مبيعات' : 'Sales'}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-base font-semibold mb-4">
                        {isRTL ? '⚡ إجراءات سريعة' : '⚡ Quick Actions'}
                    </h2>
                    <div className="space-y-2">
                        <QuickLink href={`/${locale}/admin/sellers`} icon="🏪" label={isRTL ? 'توثيق البائعين' : 'Verify Sellers'} badge={pendingSellers} />
                        <QuickLink href={`/${locale}/admin/drivers`} icon="🛵" label={isRTL ? 'توثيق السائقين' : 'Verify Drivers'} badge={pendingDrivers} />
                        <QuickLink href={`/${locale}/admin/orders`} icon="📋" label={isRTL ? 'جميع الطلبات' : 'All Orders'} />
                        <QuickLink href={`/${locale}/admin/qanz`} icon="💎" label={isRTL ? 'إدارة QANZ' : 'Manage QANZ'} />
                    </div>
                </div>

                {/* Disputes Summary */}
                <div className="card">
                    <h2 className="text-base font-semibold mb-4">
                        {isRTL ? '⚠️ النزاعات' : '⚠️ Disputes'}
                    </h2>
                    {totalDisputes === 0 ? (
                        <div className="text-center py-6">
                            <span className="text-3xl mb-2 block">✨</span>
                            <p className="text-text-muted text-sm">
                                {isRTL ? 'لا توجد نزاعات — منصتك تعمل بسلاسة!' : 'No disputes — your platform is running smoothly!'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-warning-soft rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-warning">{openDisputes}</p>
                                <p className="text-xs text-text-muted">{isRTL ? 'مفتوحة' : 'Open'}</p>
                            </div>
                            <div className="bg-success-soft rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-success">{totalDisputes - openDisputes}</p>
                                <p className="text-xs text-text-muted">{isRTL ? 'محلولة' : 'Resolved'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================
                RECENT ACTIVITY
            ======================================== */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">
                        {isRTL ? '🕐 أحدث الطلبات' : '🕐 Recent Orders'}
                    </h2>
                    <Link href={`/${locale}/admin/orders`} className="text-sm text-accent hover:underline">
                        {isRTL ? 'عرض الكل' : 'View All'} →
                    </Link>
                </div>

                {recentOrders.length > 0 ? (
                    <div className="space-y-2">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={order.status} />
                                    <div>
                                        <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-text-muted">{timeAgo(order.created_at, locale)}</p>
                                    </div>
                                </div>
                                <div className={`text-${isRTL ? 'left' : 'right'}`}>
                                    <p className="font-semibold">{Number(order.total_amount).toFixed(2)} <span className="text-xs text-text-muted">JOD</span></p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <span className="text-3xl mb-2 block">📦</span>
                        <p className="text-text-muted text-sm">
                            {isRTL ? 'لا يوجد طلبات بعد — أول طلب سيظهر هنا!' : 'No orders yet — your first order will appear here!'}
                        </p>
                    </div>
                )}
            </div>

            {/* ========================================
                EARLY STATE MESSAGE (if no revenue)
            ======================================== */}
            {!hasRevenue && (
                <div className="card bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                    <div className="text-center py-4">
                        <span className="text-3xl mb-3 block">🚀</span>
                        <h3 className="text-lg font-semibold mb-2">
                            {isRTL ? 'منصتك جاهزة!' : 'Your Platform is Ready!'}
                        </h3>
                        <p className="text-text-muted text-sm max-w-md mx-auto">
                            {isRTL
                                ? 'لم تحقق إيرادات بعد — أول طلب مكتمل سيظهر هنا. استمر!'
                                : 'No revenue yet — your first completed order will appear here. Keep going!'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========================================
// COMPONENTS
// ========================================

function PrimaryKPI({
    label,
    value,
    context,
    isCurrency,
    variant = 'default',
    icon
}: {
    label: string;
    value: number;
    context: string;
    isCurrency?: boolean;
    variant?: 'default' | 'success' | 'warning';
    icon: string;
}) {
    const variantStyles = {
        default: '',
        success: 'border-success/30',
        warning: 'border-warning/30',
    };

    const valueStyles = {
        default: 'text-text-primary',
        success: 'text-success',
        warning: 'text-warning',
    };

    return (
        <div className={`card p-5 ${variantStyles[variant]}`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] text-text-muted bg-bg-muted px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {context}
                </span>
            </div>
            <p className={`text-3xl font-bold mb-1 ${valueStyles[variant]}`}>
                {isCurrency ? value.toFixed(2) : value.toLocaleString()}
                {isCurrency && <span className="text-sm font-normal text-text-muted ml-1">JOD</span>}
            </p>
            <p className="text-sm text-text-secondary">{label}</p>
        </div>
    );
}

function SecondaryKPI({
    label,
    value,
    icon,
    subtitle,
    variant = 'default'
}: {
    label: string;
    value: number;
    icon: string;
    subtitle?: string;
    variant?: 'default' | 'warning';
}) {
    return (
        <div className={`card p-3 ${variant === 'warning' && value > 0 ? 'border-warning/30' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-text-muted">{label}</span>
            </div>
            <p className={`text-xl font-bold ${variant === 'warning' && value > 0 ? 'text-warning' : ''}`}>
                {value}
            </p>
            {subtitle && (
                <p className="text-[10px] text-text-muted">{subtitle}</p>
            )}
        </div>
    );
}

function QuickLink({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: number | null }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between p-3 rounded-xl bg-bg-muted hover:bg-border transition-colors group"
        >
            <div className="flex items-center gap-3">
                <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-warning text-white rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function StatusIcon({ status }: { status: string }) {
    const icons: Record<string, { icon: string; bg: string }> = {
        placed: { icon: '📝', bg: 'bg-accent-soft' },
        accepted: { icon: '✓', bg: 'bg-accent-soft' },
        preparing: { icon: '👨‍🍳', bg: 'bg-warning-soft' },
        ready: { icon: '📦', bg: 'bg-warning-soft' },
        assigned: { icon: '🛵', bg: 'bg-accent-soft' },
        picked_up: { icon: '🚚', bg: 'bg-accent-soft' },
        delivered: { icon: '✅', bg: 'bg-success-soft' },
        cancelled: { icon: '❌', bg: 'bg-danger-soft' },
    };
    const config = icons[status] || { icon: '📋', bg: 'bg-bg-muted' };
    return (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
            <span>{config.icon}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        placed: 'badge-primary',
        accepted: 'badge-primary',
        preparing: 'badge-warning',
        ready: 'badge-warning',
        assigned: 'badge-primary',
        picked_up: 'badge-primary',
        delivered: 'badge-success',
        cancelled: 'badge-danger',
    };
    return (
        <span className={`badge ${classes[status] || 'badge-default'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

function timeAgo(date: string, locale: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return locale === 'ar' ? 'الآن' : 'Just now';
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        return locale === 'ar' ? `منذ ${mins} د` : `${mins}m ago`;
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return locale === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
    }
    const days = Math.floor(seconds / 86400);
    return locale === 'ar' ? `منذ ${days} ي` : `${days}d ago`;
}
