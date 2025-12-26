import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { DeliveryActions } from '@/components/driver/DeliveryActions';

export default async function DriverDeliveriesPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('driver');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const tab = search.tab || 'available';

    // Build query based on tab
    let query = supabase
        .from('deliveries')
        .select(`
      id,
      status,
      cash_collected,
      pickup_at,
      delivered_at,
      created_at,
      order_id
    `)
        .order('created_at', { ascending: false });

    if (tab === 'available') {
        query = query.eq('status', 'available');
    } else if (tab === 'active') {
        query = query.eq('driver_id', user?.id).in('status', ['assigned', 'picked_up']);
    } else if (tab === 'completed') {
        query = query.eq('driver_id', user?.id).eq('status', 'delivered');
    }

    const { data: deliveries } = await query.limit(20);

    // Fetch order details separately
    const orderIds = deliveries?.map(d => d.order_id).filter(Boolean) || [];
    const { data: orders } = orderIds.length > 0
        ? await supabase
            .from('orders')
            .select('id, total_amount, delivery_fee, delivery_address, delivery_phone, seller_id')
            .in('id', orderIds)
        : { data: [] };

    // Get counts
    const { count: availableCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

    const { count: activeCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .in('status', ['assigned', 'picked_up']);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('deliveries')}</h1>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <TabLink
                    href={`/${locale}/driver/deliveries?tab=available`}
                    active={tab === 'available'}
                    label={t('availableDeliveries')}
                    count={availableCount || 0}
                    highlight
                />
                <TabLink
                    href={`/${locale}/driver/deliveries?tab=active`}
                    active={tab === 'active'}
                    label={locale === 'ar' ? 'نشطة' : 'Active'}
                    count={activeCount || 0}
                />
                <TabLink
                    href={`/${locale}/driver/deliveries?tab=completed`}
                    active={tab === 'completed'}
                    label={locale === 'ar' ? 'مكتملة' : 'Completed'}
                />
            </div>

            {/* Deliveries List */}
            {deliveries && deliveries.length > 0 ? (
                <div className="space-y-4">
                    {deliveries.map((delivery) => {
                        const order = orders?.find(o => o.id === delivery.order_id);

                        return (
                            <div
                                key={delivery.id}
                                className="bg-card rounded-xl p-5 shadow-card"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    {/* Delivery Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                #{delivery.id.slice(0, 8)}
                                            </span>
                                            <StatusBadge status={delivery.status} locale={locale} />
                                        </div>

                                        {/* Pickup Location */}
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-xs text-secondary mb-1">
                                                {locale === 'ar' ? '📦 الاستلام من' : '📦 Pickup from'}
                                            </p>
                                            <p className="font-medium">{locale === 'ar' ? 'المتجر' : 'Store'}</p>
                                        </div>

                                        {/* Delivery Location */}
                                        <div className="bg-primary/5 rounded-lg p-3">
                                            <p className="text-xs text-secondary mb-1">
                                                {locale === 'ar' ? '📍 التوصيل إلى' : '📍 Deliver to'}
                                            </p>
                                            <p className="text-sm">{order?.delivery_address}</p>
                                            <p className="text-sm text-primary">{order?.delivery_phone}</p>
                                        </div>
                                    </div>

                                    {/* Amount & Actions */}
                                    <div className="lg:text-right space-y-3">
                                        <div>
                                            <p className="text-xs text-secondary">
                                                {locale === 'ar' ? 'المبلغ المطلوب تحصيله' : 'Amount to collect'}
                                            </p>
                                            <p className="text-2xl font-bold text-success">
                                                {(Number(order?.total_amount || 0) + Number(order?.delivery_fee || 0)).toFixed(2)} JOD
                                            </p>
                                            <p className="text-xs text-secondary">
                                                ({locale === 'ar' ? 'التوصيل' : 'Delivery'}: {Number(order?.delivery_fee || 0).toFixed(2)} JOD)
                                            </p>
                                        </div>

                                        <DeliveryActions
                                            deliveryId={delivery.id}
                                            currentStatus={delivery.status}
                                            totalAmount={Number(order?.total_amount || 0) + Number(order?.delivery_fee || 0)}
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
                    <div className="text-5xl mb-4">
                        {tab === 'available' ? '🚚' : tab === 'active' ? '📦' : '✅'}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                        {tab === 'available' && (locale === 'ar'
                            ? 'لا توجد توصيلات متاحة'
                            : 'No available deliveries')}
                        {tab === 'active' && (locale === 'ar'
                            ? 'لا توجد توصيلات نشطة'
                            : 'No active deliveries')}
                        {tab === 'completed' && (locale === 'ar'
                            ? 'لم تكمل أي توصيلات بعد'
                            : 'No completed deliveries yet')}
                    </h2>
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
    count?: number;
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
            {count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${active ? 'bg-white/20' : highlight && count > 0 ? 'bg-success text-white' : 'bg-muted'
                    }`}>
                    {count}
                </span>
            )}
        </Link>
    );
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
    const statusConfig: Record<string, { bg: string; label: { en: string; ar: string } }> = {
        available: { bg: 'bg-green-100 text-green-700', label: { en: 'Available', ar: 'متاح' } },
        assigned: { bg: 'bg-blue-100 text-blue-700', label: { en: 'Assigned', ar: 'تم القبول' } },
        picked_up: { bg: 'bg-orange-100 text-orange-700', label: { en: 'Picked Up', ar: 'تم الاستلام' } },
        delivered: { bg: 'bg-green-100 text-green-700', label: { en: 'Delivered', ar: 'تم التوصيل' } },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', label: { en: status, ar: status } };

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.bg}`}>
            {locale === 'ar' ? config.label.ar : config.label.en}
        </span>
    );
}
