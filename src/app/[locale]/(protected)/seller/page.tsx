import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { SellerOnboarding } from '@/components/seller/SellerOnboarding';

export default async function SellerDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('seller');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch seller profile
    const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

    // Check if onboarding needed
    const needsOnboarding = !sellerProfile?.business_name || sellerProfile.business_name === 'My Store';

    if (needsOnboarding) {
        return <SellerOnboarding locale={locale} sellerProfile={sellerProfile} />;
    }

    // Fetch stats
    const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id);

    const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('is_active', true)
        .gt('stock', 0);

    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .in('status', ['placed', 'accepted', 'preparing']);

    // Calculate total earnings
    const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('seller_id', user?.id)
        .eq('status', 'delivered');

    const totalEarnings = deliveredOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
                    <p className="text-secondary">{sellerProfile?.business_name}</p>
                </div>
                {!sellerProfile?.is_verified && (
                    <div className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-full">
                        ⏳ {t('verificationPending')}
                    </div>
                )}
                {sellerProfile?.is_verified && (
                    <div className="px-3 py-1.5 bg-success/10 text-success text-sm rounded-full">
                        ✓ {t('verified')}
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="📦"
                    label={t('totalProducts')}
                    value={String(totalProducts || 0)}
                    color="primary"
                />
                <KPICard
                    icon="✅"
                    label={t('activeProducts')}
                    value={String(activeProducts || 0)}
                    color="success"
                />
                <KPICard
                    icon="🛒"
                    label={t('pendingOrders')}
                    value={String(pendingOrders || 0)}
                    color="warning"
                    href={`/${locale}/seller/orders`}
                />
                <KPICard
                    icon="💰"
                    label={t('totalEarnings')}
                    value={`${totalEarnings.toFixed(2)} JOD`}
                    color="accent"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href={`/${locale}/seller/products/new`}
                    className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                    <span className="font-medium">{t('addProduct')}</span>
                </Link>
                <Link
                    href={`/${locale}/seller/orders`}
                    className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                    <span className="font-medium">{t('orders')}</span>
                </Link>
                <Link
                    href={`/${locale}/seller/products`}
                    className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                    <span className="font-medium">{t('products')}</span>
                </Link>
                <Link
                    href={`/${locale}/seller/payouts`}
                    className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💳</div>
                    <span className="font-medium">{t('payouts')}</span>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{locale === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
                    <Link
                        href={`/${locale}/seller/orders`}
                        className="text-sm text-primary hover:underline"
                    >
                        {locale === 'ar' ? 'عرض الكل' : 'View All'}
                    </Link>
                </div>

                {orders && orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border">
                                    <th className="pb-3 font-medium">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                                    <th className="pb-3 font-medium">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                                    <th className="pb-3 font-medium">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                                    <th className="pb-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50">
                                        <td className="py-3 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                                        <td className="py-3 text-secondary">
                                            {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
                                        </td>
                                        <td className="py-3 font-medium">{order.total_amount} JOD</td>
                                        <td className="py-3">
                                            <StatusBadge status={order.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-secondary">
                        {locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
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
    href,
}: {
    icon: string;
    label: string;
    value: string;
    color: 'primary' | 'accent' | 'warning' | 'success';
    href?: string;
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning',
        success: 'bg-success/10 text-success',
    };

    const content = (
        <>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <span className="text-lg">{icon}</span>
                </div>
                <span className="text-sm text-secondary">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </>
    );

    if (href) {
        return (
            <Link href={href} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
                {content}
            </Link>
        );
    }

    return <div className="bg-card rounded-2xl p-5 shadow-card">{content}</div>;
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        placed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
        accepted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Accepted' },
        preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing' },
        ready: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Ready' },
        assigned: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Assigned' },
        picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Picked Up' },
        delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}
