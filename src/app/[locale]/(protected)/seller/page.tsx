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

    // Fetch wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .maybeSingle();

    // Product stats
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

    const { count: outOfStock } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('stock', 0);

    // Order stats
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id);

    const { count: newOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('status', 'placed');

    const { count: processingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .in('status', ['accepted', 'preparing', 'ready']);

    const { count: deliveredOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('status', 'delivered');

    // Earnings
    const { data: deliveredData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('seller_id', user?.id)
        .eq('status', 'delivered');

    const totalEarnings = deliveredData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const platformFee = totalEarnings * 0.05;
    const netEarnings = totalEarnings - platformFee;

    // Today's orders
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .gte('created_at', today);

    // Recent orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{sellerProfile?.business_name}</h1>
                    <p className="text-secondary">{t('dashboard')}</p>
                </div>
                <div className="flex items-center gap-2">
                    {sellerProfile?.is_verified ? (
                        <span className="px-3 py-1.5 bg-success/10 text-success text-sm rounded-full">
                            ✓ {t('verified')}
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-full">
                            ⏳ {t('verificationPending')}
                        </span>
                    )}
                </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-gradient-to-br from-success to-green-600 rounded-2xl p-6 text-white">
                <h2 className="text-lg opacity-90 mb-4">💰 {locale === 'ar' ? 'الملخص المالي' : 'Financial Summary'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{totalEarnings.toFixed(0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'} (JOD)</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{netEarnings.toFixed(0)}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'صافي الربح' : 'Net Earnings'} (JOD)</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{wallet?.balance?.toFixed(0) || 0}</p>
                        <p className="text-sm opacity-75">💎 QANZ</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{deliveredOrders || 0}</p>
                        <p className="text-sm opacity-75">{locale === 'ar' ? 'طلبات مكتملة' : 'Completed'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard icon="📦" label={locale === 'ar' ? 'المنتجات' : 'Products'} value={totalProducts || 0} />
                <StatCard icon="✅" label={locale === 'ar' ? 'نشط' : 'Active'} value={activeProducts || 0} color="success" />
                <StatCard icon="⚠️" label={locale === 'ar' ? 'نفذ المخزون' : 'Out of Stock'} value={outOfStock || 0} color="warning" />
                <StatCard icon="🆕" label={locale === 'ar' ? 'طلبات جديدة' : 'New Orders'} value={newOrders || 0} color="primary" highlight={newOrders ? newOrders > 0 : false} />
                <StatCard icon="⏳" label={locale === 'ar' ? 'قيد التنفيذ' : 'Processing'} value={processingOrders || 0} color="warning" />
                <StatCard icon="📅" label={locale === 'ar' ? 'اليوم' : 'Today'} value={todayOrders || 0} color="accent" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <QuickAction href={`/${locale}/seller/products/new`} icon="➕" label={t('addProduct')} primary />
                <QuickAction href={`/${locale}/seller/orders`} icon="📋" label={t('orders')} badge={newOrders} />
                <QuickAction href={`/${locale}/seller/products`} icon="📦" label={t('products')} />
                <QuickAction href={`/${locale}/seller/wallet`} icon="💎" label={locale === 'ar' ? 'المحفظة' : 'Wallet'} />
                <QuickAction href={`/${locale}/seller/settings`} icon="⚙️" label={locale === 'ar' ? 'الإعدادات' : 'Settings'} />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">{locale === 'ar' ? 'توزيع الطلبات' : 'Order Distribution'}</h2>
                    <div className="space-y-3">
                        <StatusBar label={locale === 'ar' ? 'جديد' : 'New'} value={newOrders || 0} total={totalOrders || 1} color="bg-blue-500" />
                        <StatusBar label={locale === 'ar' ? 'قيد التنفيذ' : 'Processing'} value={processingOrders || 0} total={totalOrders || 1} color="bg-yellow-500" />
                        <StatusBar label={locale === 'ar' ? 'تم التوصيل' : 'Delivered'} value={deliveredOrders || 0} total={totalOrders || 1} color="bg-green-500" />
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{locale === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
                        <Link href={`/${locale}/seller/orders`} className="text-sm text-primary hover:underline">
                            {locale === 'ar' ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>
                    {recentOrders && recentOrders.length > 0 ? (
                        <div className="space-y-2">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-secondary">{timeAgo(order.created_at, locale)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{order.total_amount} JOD</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary py-4">{locale === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, highlight }: { icon: string; label: string; value: number; color?: string; highlight?: boolean }) {
    return (
        <div className={`bg-card rounded-xl p-4 shadow-card relative ${highlight ? 'ring-2 ring-primary' : ''}`}>
            {highlight && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />}
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
            className={`rounded-xl p-4 text-center transition-all group relative ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-card shadow-card hover:shadow-card-hover'
                }`}
        >
            {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-white text-xs rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-medium text-sm">{label}</span>
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
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        placed: 'bg-blue-100 text-blue-700',
        accepted: 'bg-purple-100 text-purple-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-orange-100 text-orange-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}

function timeAgo(date: string, locale: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return locale === 'ar' ? 'الآن' : 'Just now';
    if (seconds < 3600) return locale === 'ar' ? `منذ ${Math.floor(seconds / 60)} د` : `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return locale === 'ar' ? `منذ ${Math.floor(seconds / 3600)} س` : `${Math.floor(seconds / 3600)}h`;
    return locale === 'ar' ? `منذ ${Math.floor(seconds / 86400)} ي` : `${Math.floor(seconds / 86400)}d`;
}
