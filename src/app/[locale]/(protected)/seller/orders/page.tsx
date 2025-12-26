import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { OrderActions } from '@/components/seller/OrderActions';

export default async function SellerOrdersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('seller');
    const tStatus = await getTranslations('order.status');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const tab = search.tab || 'new';

    // Build query based on tab
    let query = supabase
        .from('orders')
        .select(`
      id,
      status,
      total_amount,
      delivery_fee,
      delivery_address,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(full_name, phone)
    `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

    if (tab === 'new') {
        query = query.eq('status', 'placed');
    } else if (tab === 'processing') {
        query = query.in('status', ['accepted', 'preparing', 'ready']);
    } else if (tab === 'completed') {
        query = query.in('status', ['picked_up', 'delivered']);
    }

    const { data: orders } = await query;

    // Get counts for tabs
    const { count: newCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('status', 'placed');

    const { count: processingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .in('status', ['accepted', 'preparing', 'ready']);

    const { count: completedCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .in('status', ['picked_up', 'delivered']);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('orders')}</h1>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <TabLink
                    href={`/${locale}/seller/orders?tab=new`}
                    active={tab === 'new'}
                    label={locale === 'ar' ? 'جديد' : 'New'}
                    count={newCount || 0}
                    highlight
                />
                <TabLink
                    href={`/${locale}/seller/orders?tab=processing`}
                    active={tab === 'processing'}
                    label={locale === 'ar' ? 'قيد التنفيذ' : 'Processing'}
                    count={processingCount || 0}
                />
                <TabLink
                    href={`/${locale}/seller/orders?tab=completed`}
                    active={tab === 'completed'}
                    label={locale === 'ar' ? 'مكتمل' : 'Completed'}
                    count={completedCount || 0}
                />
            </div>

            {/* Orders List */}
            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer;
                        return (
                            <div
                                key={order.id}
                                className="bg-card rounded-xl p-5 shadow-card"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                            <StatusBadge status={order.status} t={tStatus} />
                                            {order.status === 'placed' && (
                                                <span className="text-xs text-warning animate-pulse">
                                                    🔔 {locale === 'ar' ? 'جديد!' : 'New!'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-sm text-secondary">
                                                    {locale === 'ar' ? 'العميل' : 'Customer'}
                                                </p>
                                                <p className="font-medium">{buyer?.full_name || 'N/A'}</p>
                                                <p className="text-sm text-secondary">{buyer?.phone || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-secondary">
                                                    {locale === 'ar' ? 'العنوان' : 'Address'}
                                                </p>
                                                <p className="text-sm">{order.delivery_address}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-secondary mt-3">
                                            {new Date(order.created_at).toLocaleString(
                                                locale === 'ar' ? 'ar-JO' : 'en-JO'
                                            )}
                                        </p>
                                    </div>

                                    {/* Amount & Actions */}
                                    <div className="md:text-right space-y-3">
                                        <div>
                                            <p className="text-2xl font-bold text-primary">
                                                {Number(order.total_amount).toFixed(2)} JOD
                                            </p>
                                            <p className="text-xs text-secondary">
                                                + {Number(order.delivery_fee).toFixed(2)} {locale === 'ar' ? 'توصيل' : 'delivery'}
                                            </p>
                                        </div>

                                        <OrderActions
                                            orderId={order.id}
                                            currentStatus={order.status}
                                            locale={locale}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl shadow-card">
                    <div className="text-5xl mb-4">📋</div>
                    <h2 className="text-xl font-semibold mb-2">
                        {locale === 'ar' ? 'لا توجد طلبات' : 'No orders'}
                    </h2>
                    <p className="text-secondary">
                        {tab === 'new' && (locale === 'ar'
                            ? 'لا توجد طلبات جديدة حالياً'
                            : 'No new orders at the moment')}
                        {tab === 'processing' && (locale === 'ar'
                            ? 'لا توجد طلبات قيد التنفيذ'
                            : 'No orders being processed')}
                        {tab === 'completed' && (locale === 'ar'
                            ? 'لم تكمل أي طلبات بعد'
                            : 'No completed orders yet')}
                    </p>
                </div>
            )}
        </div>
    );
}

function TabLink({
    href,
    active,
    label,
    count,
    highlight,
}: {
    href: string;
    active: boolean;
    label: string;
    count: number;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
        >
            {label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${active ? 'bg-white/20' : highlight && count > 0 ? 'bg-error text-white' : 'bg-muted'
                }`}>
                {count}
            </span>
        </Link>
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

    const statusKey = status.replace('_', '');

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[status] || 'bg-gray-100'}`}>
            {t(statusKey)}
        </span>
    );
}
