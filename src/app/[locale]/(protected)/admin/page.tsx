import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    // Fetch platform stats
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: totalBuyers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'buyer');

    const { count: totalSellers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

    const { count: totalDrivers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver');

    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // Revenue calculations
    const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('total_amount, delivery_fee, created_at')
        .eq('status', 'delivered');

    const totalRevenue = deliveredOrders?.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0
    ) || 0;

    const totalDeliveryFees = deliveredOrders?.reduce(
        (sum, o) => sum + Number(o.delivery_fee),
        0
    ) || 0;

    const platformFees = totalRevenue * 0.05;

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    const { data: todayDelivered } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('created_at', today);

    const todayRevenue = todayDelivered?.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0
    ) || 0;

    // Order status breakdown
    const { count: placedOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'placed');
    const { count: processingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'preparing', 'ready']);
    const { count: deliveredCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered');
    const { count: cancelledOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled');

    // Pending verifications
    const { count: pendingSellers } = await supabase
        .from('seller_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);

    const { count: pendingDrivers } = await supabase
        .from('driver_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);

    // Recent activity
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(8);

    // New users today
    const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
                    <p className="text-secondary text-sm">
                        {locale === 'ar' ? 'نظرة عامة على المنصة' : 'Platform Overview'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-secondary">
                        {new Date().toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Today's Highlights */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
                <h2 className="text-lg font-semibold mb-4 opacity-90">
                    {locale === 'ar' ? '📊 إحصائيات اليوم' : '📊 Today\'s Highlights'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{todayOrders || 0}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'طلبات جديدة' : 'New Orders'}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{todayRevenue.toFixed(0)} <span className="text-lg">JOD</span></p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'إيرادات اليوم' : 'Today Revenue'}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{newUsersToday || 0}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'مستخدمين جدد' : 'New Users'}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{(pendingSellers || 0) + (pendingDrivers || 0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'بانتظار التوثيق' : 'Pending Verification'}</p>
                    </div>
                </div>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard icon="👥" label={t('totalUsers')} value={totalUsers || 0} />
                <KPICard icon="🛒" label={locale === 'ar' ? 'مشترين' : 'Buyers'} value={totalBuyers || 0} />
                <KPICard icon="🏪" label={t('totalSellers')} value={totalSellers || 0} highlight={pendingSellers ? pendingSellers > 0 : false} />
                <KPICard icon="🛵" label={t('totalDrivers')} value={totalDrivers || 0} highlight={pendingDrivers ? pendingDrivers > 0 : false} />
                <KPICard icon="📦" label={t('totalOrders')} value={totalOrders || 0} />
                <KPICard icon="🏷️" label={locale === 'ar' ? 'منتجات' : 'Products'} value={totalProducts || 0} />
            </div>

            {/* Financial Overview & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial */}
                <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">
                        {locale === 'ar' ? '💰 النظرة المالية' : '💰 Financial Overview'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-success/10 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-success">{totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-secondary">{locale === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'} (JOD)</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{platformFees.toFixed(2)}</p>
                            <p className="text-xs text-secondary">{locale === 'ar' ? 'عمولة المنصة 5%' : 'Platform Fee 5%'} (JOD)</p>
                        </div>
                        <div className="bg-warning/10 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-warning">{totalDeliveryFees.toFixed(2)}</p>
                            <p className="text-xs text-secondary">{locale === 'ar' ? 'رسوم التوصيل' : 'Delivery Fees'} (JOD)</p>
                        </div>
                        <div className="bg-accent/10 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-accent">{deliveredCount || 0}</p>
                            <p className="text-xs text-secondary">{locale === 'ar' ? 'طلبات مكتملة' : 'Completed Orders'}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">
                        {locale === 'ar' ? '⚡ إجراءات سريعة' : '⚡ Quick Actions'}
                    </h2>
                    <div className="space-y-2">
                        <QuickLink href={`/${locale}/admin/sellers`} icon="🏪" label={locale === 'ar' ? 'توثيق البائعين' : 'Verify Sellers'} badge={pendingSellers} />
                        <QuickLink href={`/${locale}/admin/drivers`} icon="🛵" label={locale === 'ar' ? 'توثيق السائقين' : 'Verify Drivers'} badge={pendingDrivers} />
                        <QuickLink href={`/${locale}/admin/qanz`} icon="💎" label={locale === 'ar' ? 'توليد أكواد QANZ' : 'Generate QANZ'} />
                        <QuickLink href={`/${locale}/admin/users`} icon="👥" label={locale === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'} />
                        <QuickLink href={`/${locale}/admin/orders`} icon="📋" label={locale === 'ar' ? 'جميع الطلبات' : 'All Orders'} />
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">
                        {locale === 'ar' ? '📊 توزيع الطلبات' : '📊 Order Status Breakdown'}
                    </h2>
                    <div className="space-y-3">
                        <StatusBar label={locale === 'ar' ? 'جديد' : 'Placed'} value={placedOrders || 0} total={totalOrders || 1} color="bg-blue-500" />
                        <StatusBar label={locale === 'ar' ? 'قيد التنفيذ' : 'Processing'} value={processingOrders || 0} total={totalOrders || 1} color="bg-yellow-500" />
                        <StatusBar label={locale === 'ar' ? 'تم التوصيل' : 'Delivered'} value={deliveredCount || 0} total={totalOrders || 1} color="bg-green-500" />
                        <StatusBar label={locale === 'ar' ? 'ملغي' : 'Cancelled'} value={cancelledOrders || 0} total={totalOrders || 1} color="bg-red-500" />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {locale === 'ar' ? '🕐 النشاط الأخير' : '🕐 Recent Activity'}
                        </h2>
                        <Link href={`/${locale}/admin/orders`} className="text-sm text-primary hover:underline">
                            {locale === 'ar' ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {recentOrders && recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon status={order.status} />
                                        <div>
                                            <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-secondary">
                                                {timeAgo(order.created_at, locale)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{Number(order.total_amount).toFixed(2)} JOD</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-secondary py-4">
                                {locale === 'ar' ? 'لا يوجد نشاط' : 'No activity yet'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, highlight }: { icon: string; label: string; value: number; highlight?: boolean }) {
    return (
        <div className={`bg-card rounded-xl p-4 shadow-card relative ${highlight ? 'ring-2 ring-warning' : ''}`}>
            {highlight && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse" />
            )}
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-secondary truncate">{label}</p>
        </div>
    );
}

function QuickLink({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: number | null }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
        >
            <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-medium">{label}</span>
            </div>
            {badge && badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-warning text-white rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-medium">{value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    const icons: Record<string, string> = {
        placed: '📝',
        accepted: '✓',
        preparing: '👨‍🍳',
        ready: '📦',
        picked_up: '🛵',
        delivered: '✅',
        cancelled: '❌',
    };
    return <span className="text-lg">{icons[status] || '📋'}</span>;
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        placed: 'bg-blue-100 text-blue-700',
        accepted: 'bg-purple-100 text-purple-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-orange-100 text-orange-700',
        picked_up: 'bg-cyan-100 text-cyan-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${colors[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
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
