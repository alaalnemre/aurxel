import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function BuyerDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('buyer');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .maybeSingle();

    // Fetch wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    // Fetch orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount, delivery_fee, created_at')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // Stats
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id);

    const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id)
        .in('status', ['placed', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up']);

    const { count: deliveredOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id)
        .eq('status', 'delivered');

    // Total spent
    const { data: deliveredData } = await supabase
        .from('orders')
        .select('total_amount, delivery_fee')
        .eq('buyer_id', user?.id)
        .eq('status', 'delivered');

    const totalSpent = deliveredData?.reduce(
        (sum, o) => sum + Number(o.total_amount) + Number(o.delivery_fee),
        0
    ) || 0;

    // This month's orders
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());

    const greeting = getGreeting(locale);
    const isRTL = locale === 'ar';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Hero Section - Softened gradient, subtle greeting */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/90 to-accent p-6 text-white">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }} />
                </div>

                <div className="relative">
                    {/* Greeting - Secondary text */}
                    <p className="text-sm text-white/70 mb-1">{greeting}</p>

                    {/* Name - Not too dominant */}
                    <h1 className="text-xl font-semibold mb-6">
                        {profile?.full_name || t('dashboard')}
                    </h1>

                    {/* Key Stats - Emphasized */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href={`/${locale}/buyer/wallet`} className="group">
                            <div className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all group-hover:-translate-y-0.5">
                                <p className="text-2xl font-bold">{wallet?.balance?.toFixed(0) || 0}</p>
                                <p className="text-xs text-white/70 flex items-center gap-1">
                                    <span>💎</span> QANZ
                                </p>
                            </div>
                        </Link>
                        <Link href={`/${locale}/buyer/orders`} className="group">
                            <div className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all group-hover:-translate-y-0.5">
                                <p className="text-2xl font-bold">{totalOrders || 0}</p>
                                <p className="text-xs text-white/70">
                                    {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                                </p>
                            </div>
                        </Link>
                        <Link href={`/${locale}/buyer/orders?status=active`} className="group">
                            <div className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all group-hover:-translate-y-0.5">
                                <p className="text-2xl font-bold">{activeOrders || 0}</p>
                                <p className="text-xs text-white/70">
                                    {isRTL ? 'طلبات نشطة' : 'Active'}
                                </p>
                            </div>
                        </Link>
                        <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-2xl font-bold">{totalSpent.toFixed(0)}</p>
                            <p className="text-xs text-white/70 flex items-center gap-1">
                                <span>💰</span> JOD {isRTL ? 'مُنفق' : 'Spent'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Compact with hover */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    href={`/${locale}/buyer/orders?status=delivered`}
                    icon="📦"
                    label={isRTL ? 'تم التوصيل' : 'Delivered'}
                    value={deliveredOrders || 0}
                    color="success"
                />
                <StatCard
                    href={`/${locale}/buyer/orders?status=active`}
                    icon="🚚"
                    label={isRTL ? 'قيد التوصيل' : 'In Transit'}
                    value={activeOrders || 0}
                    color="warning"
                />
                <StatCard
                    href={`/${locale}/buyer/orders`}
                    icon="📅"
                    label={isRTL ? 'هذا الشهر' : 'This Month'}
                    value={monthOrders || 0}
                    color="primary"
                />
                <StatCard
                    href={`/${locale}/buyer/orders`}
                    icon="⭐"
                    label={isRTL ? 'تقييماتي' : 'Reviews'}
                    value={0}
                    color="accent"
                />
            </div>

            {/* Quick Actions - Interactive cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction
                    href={`/${locale}/products`}
                    icon="🛍️"
                    label={isRTL ? 'تسوق الآن' : 'Shop Now'}
                    description={isRTL ? 'تصفح المنتجات' : 'Browse products'}
                    primary
                />
                <QuickAction
                    href={`/${locale}/buyer/orders`}
                    icon="📋"
                    label={isRTL ? 'طلباتي' : 'My Orders'}
                    description={isRTL ? 'تتبع طلباتك' : 'Track your orders'}
                />
                <QuickAction
                    href={`/${locale}/buyer/wallet`}
                    icon="💎"
                    label={isRTL ? 'محفظتي' : 'Wallet'}
                    description={isRTL ? 'رصيد QANZ' : 'QANZ balance'}
                />
                <QuickAction
                    href={`/${locale}/cart`}
                    icon="🛒"
                    label={isRTL ? 'السلة' : 'Cart'}
                    description={isRTL ? 'عرض السلة' : 'View cart'}
                />
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">{t('recentOrders')}</h2>
                    <Link
                        href={`/${locale}/buyer/orders`}
                        className="text-sm text-accent hover:text-accent-hover transition-colors"
                    >
                        {isRTL ? 'عرض الكل' : 'View All'} →
                    </Link>
                </div>

                {orders && orders.length > 0 ? (
                    <div className="space-y-2">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/${locale}/buyer/orders/${order.id}`}
                                className="flex items-center justify-between p-3 rounded-xl border border-border-muted hover:border-accent hover:bg-bg-muted transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={order.status} />
                                    <div>
                                        <p className="font-medium text-sm group-hover:text-accent transition-colors">
                                            #{order.id.slice(0, 8)}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {timeAgo(order.created_at, locale)}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-${isRTL ? 'left' : 'right'}`}>
                                    <p className="font-semibold text-sm">
                                        {(Number(order.total_amount) + Number(order.delivery_fee)).toFixed(2)} JOD
                                    </p>
                                    <StatusBadge status={order.status} locale={locale} />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <EmptyState locale={locale} />
                )}
            </div>
        </div>
    );
}

// Empty State - Encouraging copy
function EmptyState({ locale }: { locale: string }) {
    const isRTL = locale === 'ar';

    return (
        <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-soft flex items-center justify-center">
                <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
                {isRTL ? 'هل أنت مستعد لطلبك الأول؟' : 'Ready to place your first order?'}
            </h3>
            <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">
                {isRTL
                    ? 'استكشف المنتجات المحلية الأردنية وادعم المتاجر المحلية'
                    : 'Explore local Jordanian products and support local stores'
                }
            </p>
            <Link
                href={`/${locale}/products`}
                className="btn btn-primary"
            >
                {isRTL ? 'ابدأ التسوق' : 'Start Shopping'}
            </Link>
        </div>
    );
}

function getGreeting(locale: string): string {
    const hour = new Date().getHours();
    if (hour < 12) return locale === 'ar' ? 'صباح الخير 👋' : 'Good morning 👋';
    if (hour < 17) return locale === 'ar' ? 'مساء الخير 👋' : 'Good afternoon 👋';
    return locale === 'ar' ? 'مساء الخير 👋' : 'Good evening 👋';
}

// Stats Card - Compact, clickable, with hover
function StatCard({
    href,
    icon,
    label,
    value,
    color
}: {
    href: string;
    icon: string;
    label: string;
    value: number;
    color: string;
}) {
    const colors: Record<string, string> = {
        primary: 'bg-accent-soft text-accent',
        accent: 'bg-accent-soft text-accent',
        warning: 'bg-warning-soft text-warning',
        success: 'bg-success-soft text-success',
    };

    return (
        <Link
            href={href}
            className="card p-3 hover:border-transparent hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]} mb-2`}>
                <span className="text-sm">{icon}</span>
            </div>
            <p className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
        </Link>
    );
}

// Quick Action - Interactive card with description
function QuickAction({
    href,
    icon,
    label,
    description,
    primary
}: {
    href: string;
    icon: string;
    label: string;
    description: string;
    primary?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`rounded-xl p-4 transition-all group hover:-translate-y-0.5 ${primary
                    ? 'bg-accent text-white hover:shadow-lg hover:shadow-accent/20'
                    : 'card hover:border-accent hover:shadow-md'
                }`}
        >
            <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${primary ? '' : ''}`}>
                {icon}
            </div>
            <p className={`font-medium text-sm ${primary ? 'text-white' : 'text-text-primary'}`}>
                {label}
            </p>
            <p className={`text-xs mt-0.5 ${primary ? 'text-white/70' : 'text-text-muted'}`}>
                {description}
            </p>
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
            <span className="text-base">{config.icon}</span>
        </div>
    );
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
    const config: Record<string, { classes: string; label: { en: string; ar: string } }> = {
        placed: { classes: 'badge-primary', label: { en: 'Placed', ar: 'جديد' } },
        accepted: { classes: 'badge-primary', label: { en: 'Accepted', ar: 'مقبول' } },
        preparing: { classes: 'badge-warning', label: { en: 'Preparing', ar: 'قيد التحضير' } },
        ready: { classes: 'badge-warning', label: { en: 'Ready', ar: 'جاهز' } },
        assigned: { classes: 'badge-primary', label: { en: 'Assigned', ar: 'تم التعيين' } },
        picked_up: { classes: 'badge-primary', label: { en: 'In Transit', ar: 'في الطريق' } },
        delivered: { classes: 'badge-success', label: { en: 'Delivered', ar: 'تم التوصيل' } },
        cancelled: { classes: 'badge-danger', label: { en: 'Cancelled', ar: 'ملغي' } },
    };
    const c = config[status] || { classes: 'badge-default', label: { en: status, ar: status } };

    return (
        <span className={`badge ${c.classes}`}>
            {locale === 'ar' ? c.label.ar : c.label.en}
        </span>
    );
}

function timeAgo(date: string, locale: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return locale === 'ar' ? 'الآن' : 'Just now';
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        return locale === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    const days = Math.floor(seconds / 86400);
    return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
}
