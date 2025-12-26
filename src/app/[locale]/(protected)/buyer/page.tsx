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
    const tOrder = await getTranslations('order.status');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch buyer stats
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id);

    const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user?.id)
        .not('status', 'in', '("delivered","cancelled")');

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="💳"
                    label={t('qanzBalance')}
                    value={`${wallet?.balance || 0} QANZ`}
                    color="primary"
                />
                <KPICard
                    icon="📦"
                    label={t('myOrders')}
                    value={String(totalOrders || 0)}
                    color="accent"
                />
                <KPICard
                    icon="🚚"
                    label={locale === 'ar' ? 'طلبات نشطة' : 'Active Orders'}
                    value={String(activeOrders || 0)}
                    color="warning"
                />
                <KPICard
                    icon="⭐"
                    label={locale === 'ar' ? 'تقييماتي' : 'My Reviews'}
                    value="0"
                    color="success"
                />
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t('recentOrders')}</h2>
                    <Link
                        href={`/${locale}/buyer/orders`}
                        className="text-sm text-primary hover:underline"
                    >
                        {locale === 'ar' ? 'عرض الكل' : 'View All'}
                    </Link>
                </div>

                {orders && orders.length > 0 ? (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <span className="text-lg">📦</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {locale === 'ar' ? 'طلب' : 'Order'} #{order.id.slice(0, 8)}
                                        </p>
                                        <p className="text-sm text-secondary">
                                            {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{order.total_amount} JOD</p>
                                    <StatusBadge status={order.status} t={tOrder} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">🛒</div>
                        <p className="text-secondary mb-4">{t('noOrders')}</p>
                        <Link
                            href={`/${locale}/products`}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            {t('startShopping')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function KPICard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: string;
    color: 'primary' | 'accent' | 'warning' | 'success';
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning',
        success: 'bg-success/10 text-success',
    };

    return (
        <div className="bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <span className="text-lg">{icon}</span>
                </div>
                <span className="text-sm text-secondary">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
    const statusColors: Record<string, string> = {
        placed: 'bg-blue-100 text-blue-700',
        accepted: 'bg-purple-100 text-purple-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-orange-100 text-orange-700',
        assigned: 'bg-indigo-100 text-indigo-700',
        picked_up: 'bg-cyan-100 text-cyan-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
            {t(status.replace('_', ''))}
        </span>
    );
}
