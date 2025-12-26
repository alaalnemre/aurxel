import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export default async function DriverEarningsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('driver');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get completed deliveries
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select('id, cash_collected, delivered_at, order_id')
        .eq('driver_id', user?.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

    // Fetch order details separately
    const orderIds = deliveries?.map(d => d.order_id).filter(Boolean) || [];
    const { data: orders } = orderIds.length > 0
        ? await supabase
            .from('orders')
            .select('id, delivery_fee')
            .in('id', orderIds)
        : { data: [] };

    // Calculate stats
    const totalCashCollected = deliveries?.reduce(
        (sum, d) => sum + (Number(d.cash_collected) || 0),
        0
    ) || 0;

    const totalDeliveries = deliveries?.length || 0;

    // Driver earns the delivery fee
    const totalEarnings = deliveries?.reduce((sum, d) => {
        const order = orders?.find(o => o.id === d.order_id);
        return sum + (Number(order?.delivery_fee) || 0);
    }, 0) || 0;

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries?.filter(
        (d) => d.delivered_at?.startsWith(today)
    );
    const todayEarnings = todayDeliveries?.reduce((sum, d) => {
        const order = orders?.find(o => o.id === d.order_id);
        return sum + (Number(order?.delivery_fee) || 0);
    }, 0) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('earnings')}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="🚚"
                    label={t('totalDeliveries')}
                    value={String(totalDeliveries)}
                    color="primary"
                />
                <KPICard
                    icon="💰"
                    label={t('totalEarnings')}
                    value={`${totalEarnings.toFixed(2)} JOD`}
                    color="success"
                />
                <KPICard
                    icon="📅"
                    label={t('todayEarnings')}
                    value={`${todayEarnings.toFixed(2)} JOD`}
                    color="accent"
                />
                <KPICard
                    icon="💵"
                    label={t('cashCollected')}
                    value={`${totalCashCollected.toFixed(2)} JOD`}
                    color="warning"
                />
            </div>

            {/* How it works */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>ℹ️</span>
                    {locale === 'ar' ? 'كيف تعمل الأرباح' : 'How Earnings Work'}
                </h2>
                <div className="space-y-3 text-secondary">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">💵</span>
                        <div>
                            <p className="font-medium text-foreground">
                                {locale === 'ar' ? 'تحصيل النقد' : 'Cash Collection'}
                            </p>
                            <p className="text-sm">
                                {locale === 'ar'
                                    ? 'تقوم بتحصيل المبلغ الكامل من العميل عند التوصيل'
                                    : 'You collect the full amount from the customer upon delivery'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🏦</span>
                        <div>
                            <p className="font-medium text-foreground">
                                {locale === 'ar' ? 'التسوية' : 'Settlement'}
                            </p>
                            <p className="text-sm">
                                {locale === 'ar'
                                    ? 'تقوم بتسليم مبلغ البضاعة للمنصة وتحتفظ برسوم التوصيل'
                                    : 'You hand over the product amount and keep the delivery fee'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-xl">💰</span>
                        <div>
                            <p className="font-medium text-foreground">
                                {locale === 'ar' ? 'أرباحك' : 'Your Earnings'}
                            </p>
                            <p className="text-sm">
                                {locale === 'ar'
                                    ? 'رسوم التوصيل هي أرباحك الصافية'
                                    : 'The delivery fee is your net earning'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings History */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">
                    {locale === 'ar' ? 'سجل الأرباح' : 'Earnings History'}
                </h2>

                {deliveries && deliveries.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border">
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'التاريخ' : 'Date'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'المتجر' : 'Store'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'تم تحصيله' : 'Collected'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'أرباحك' : 'Your Earning'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {deliveries.map((d) => {
                                    const order = orders?.find(o => o.id === d.order_id);

                                    return (
                                        <tr key={d.id} className="hover:bg-muted/30">
                                            <td className="py-3 text-secondary">
                                                {d.delivered_at
                                                    ? new Date(d.delivered_at).toLocaleDateString(
                                                        locale === 'ar' ? 'ar-JO' : 'en-JO'
                                                    )
                                                    : '-'}
                                            </td>
                                            <td className="py-3">{locale === 'ar' ? 'متجر' : 'Store'}</td>
                                            <td className="py-3">
                                                {Number(d.cash_collected || 0).toFixed(2)} JOD
                                            </td>
                                            <td className="py-3 font-medium text-success">
                                                +{Number(order?.delivery_fee || 0).toFixed(2)} JOD
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-secondary">
                        {locale === 'ar' ? 'لا توجد أرباح بعد' : 'No earnings yet'}
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
