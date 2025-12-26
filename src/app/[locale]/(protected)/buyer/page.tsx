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

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Welcome Header */}
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white">
                <p className="text-lg opacity-90">{greeting}</p>
                <h1 className="text-2xl font-bold mb-4">{profile?.full_name || t('dashboard')}</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{wallet?.balance?.toFixed(0) || 0}</p>
                        <p className="text-sm opacity-75">💎 QANZ</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalOrders || 0}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{activeOrders || 0}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'طلبات نشطة' : 'Active'}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalSpent.toFixed(0)}</p>
                        <p className="text-sm opacity-75">💰 JOD {locale === 'ar' ? 'مُنفق' : 'Spent'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon="📦"
                    label={locale === 'ar' ? 'تم التوصيل' : 'Delivered'}
                    value={deliveredOrders || 0}
                    color="success"
                />
                <StatCard
                    icon="🚚"
                    label={locale === 'ar' ? 'قيد التوصيل' : 'In Transit'}
                    value={activeOrders || 0}
                    color="warning"
                />
                <StatCard
                    icon="📅"
                    label={locale === 'ar' ? 'هذا الشهر' : 'This Month'}
                    value={monthOrders || 0}
                    color="primary"
                />
                <StatCard
                    icon="⭐"
                    label={locale === 'ar' ? 'تقييماتي' : 'Reviews'}
                    value={0}
                    color="accent"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction href={`/${locale}/products`} icon="🛍️" label={locale === 'ar' ? 'تسوق الآن' : 'Shop Now'} primary />
                <QuickAction href={`/${locale}/buyer/orders`} icon="📋" label={locale === 'ar' ? 'طلباتي' : 'My Orders'} />
                <QuickAction href={`/${locale}/buyer/wallet`} icon="💎" label={locale === 'ar' ? 'محفظتي' : 'Wallet'} />
                <QuickAction href={`/${locale}/cart`} icon="🛒" label={locale === 'ar' ? 'السلة' : 'Cart'} />
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t('recentOrders')}</h2>
                    <Link href={`/${locale}/buyer/orders`} className="text-sm text-primary hover:underline">
                        {locale === 'ar' ? 'عرض الكل' : 'View All'}
                    </Link>
                </div>

                {orders && orders.length > 0 ? (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/${locale}/buyer/orders/${order.id}`}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={order.status} />
                                    <div>
                                        <p className="font-medium">
                                            #{order.id.slice(0, 8)}
                                        </p>
                                        <p className="text-sm text-secondary">
                                            {timeAgo(order.created_at, locale)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {(Number(order.total_amount) + Number(order.delivery_fee)).toFixed(2)} JOD
                                    </p>
                                    <StatusBadge status={order.status} locale={locale} />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-3">🛒</div>
                        <p className="text-secondary mb-4">{t('noOrders')}</p>
                        <Link
                            href={`/${locale}/products`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                        >
                            {t('startShopping')} →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function getGreeting(locale: string): string {
    const hour = new Date().getHours();
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning';
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon';
    return locale === 'ar' ? 'مساء الخير' : 'Good evening';
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning',
        success: 'bg-success/10 text-success',
    };
    return (
        <div className="bg-card rounded-xl p-4 shadow-card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-secondary">{label}</p>
        </div>
    );
}

function QuickAction({ href, icon, label, primary }: { href: string; icon: string; label: string; primary?: boolean }) {
    return (
        <Link
            href={href}
            className={`rounded-xl p-4 text-center transition-all group ${primary
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-card shadow-card hover:shadow-card-hover'
                }`}
        >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}

function StatusIcon({ status }: { status: string }) {
    const icons: Record<string, { icon: string; bg: string }> = {
        placed: { icon: '📝', bg: 'bg-blue-100' },
        accepted: { icon: '✓', bg: 'bg-purple-100' },
        preparing: { icon: '👨‍🍳', bg: 'bg-yellow-100' },
        ready: { icon: '📦', bg: 'bg-orange-100' },
        assigned: { icon: '🛵', bg: 'bg-indigo-100' },
        picked_up: { icon: '🚚', bg: 'bg-cyan-100' },
        delivered: { icon: '✅', bg: 'bg-green-100' },
        cancelled: { icon: '❌', bg: 'bg-red-100' },
    };
    const config = icons[status] || { icon: '📋', bg: 'bg-gray-100' };
    return (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
            <span className="text-lg">{config.icon}</span>
        </div>
    );
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
    const config: Record<string, { bg: string; label: { en: string; ar: string } }> = {
        placed: { bg: 'bg-blue-100 text-blue-700', label: { en: 'Placed', ar: 'جديد' } },
        accepted: { bg: 'bg-purple-100 text-purple-700', label: { en: 'Accepted', ar: 'مقبول' } },
        preparing: { bg: 'bg-yellow-100 text-yellow-700', label: { en: 'Preparing', ar: 'قيد التحضير' } },
        ready: { bg: 'bg-orange-100 text-orange-700', label: { en: 'Ready', ar: 'جاهز' } },
        assigned: { bg: 'bg-indigo-100 text-indigo-700', label: { en: 'Assigned', ar: 'تم التعيين' } },
        picked_up: { bg: 'bg-cyan-100 text-cyan-700', label: { en: 'Picked Up', ar: 'تم الاستلام' } },
        delivered: { bg: 'bg-green-100 text-green-700', label: { en: 'Delivered', ar: 'تم التوصيل' } },
        cancelled: { bg: 'bg-red-100 text-red-700', label: { en: 'Cancelled', ar: 'ملغي' } },
    };
    const c = config[status] || { bg: 'bg-gray-100', label: { en: status, ar: status } };
    return (
        <span className={`text-xs px-2 py-1 rounded-full ${c.bg}`}>
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
