import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export default async function SellerPayoutsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('seller');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get all delivered orders
    const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('id, total_amount, delivery_fee, created_at')
        .eq('seller_id', user?.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

    // Calculate earnings
    const totalEarnings = deliveredOrders?.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0
    ) || 0;

    const platformFee = totalEarnings * 0.05; // 5% platform fee
    const netEarnings = totalEarnings - platformFee;

    // Get pending orders (not yet delivered)
    const { data: pendingOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('seller_id', user?.id)
        .neq('status', 'delivered')
        .neq('status', 'cancelled');

    const pendingEarnings = pendingOrders?.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0
    ) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('payouts')}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="💰"
                    label={locale === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
                    value={`${totalEarnings.toFixed(2)} JOD`}
                    color="primary"
                />
                <KPICard
                    icon="🏦"
                    label={locale === 'ar' ? 'رسوم المنصة (5%)' : 'Platform Fee (5%)'}
                    value={`-${platformFee.toFixed(2)} JOD`}
                    color="warning"
                />
                <KPICard
                    icon="✅"
                    label={locale === 'ar' ? 'صافي الأرباح' : 'Net Earnings'}
                    value={`${netEarnings.toFixed(2)} JOD`}
                    color="success"
                />
                <KPICard
                    icon="⏳"
                    label={locale === 'ar' ? 'أرباح معلقة' : 'Pending Earnings'}
                    value={`${pendingEarnings.toFixed(2)} JOD`}
                    color="accent"
                />
            </div>

            {/* Payout Info */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>ℹ️</span>
                    {locale === 'ar' ? 'نظام الدفعات' : 'Payout System'}
                </h2>
                <div className="space-y-4 text-secondary">
                    <p>
                        {locale === 'ar'
                            ? 'يتم تحويل أرباحك تلقائياً بعد تأكيد التوصيل بـ 7 أيام. رسوم المنصة 5% من قيمة كل طلب.'
                            : 'Your earnings are automatically transferred 7 days after delivery confirmation. Platform fee is 5% per order.'}
                    </p>
                    <div className="bg-muted/50 rounded-xl p-4">
                        <p className="font-medium text-foreground mb-2">
                            {locale === 'ar' ? 'طرق الدفع المتاحة:' : 'Available payout methods:'}
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span>🏦</span>
                                {locale === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📱</span>
                                {locale === 'ar' ? 'محفظة إلكترونية (eFAWATEERcom)' : 'E-Wallet (eFAWATEERcom)'}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Earnings History */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">
                    {locale === 'ar' ? 'سجل الأرباح' : 'Earnings History'}
                </h2>

                {deliveredOrders && deliveredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border">
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'التاريخ' : 'Date'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'المبلغ' : 'Amount'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'الرسوم' : 'Fee'}
                                    </th>
                                    <th className="pb-3 font-medium">
                                        {locale === 'ar' ? 'الصافي' : 'Net'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {deliveredOrders.map((order) => {
                                    const amount = Number(order.total_amount);
                                    const fee = amount * 0.05;
                                    const net = amount - fee;
                                    return (
                                        <tr key={order.id} className="hover:bg-muted/30">
                                            <td className="py-3 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                                            <td className="py-3 text-secondary">
                                                {new Date(order.created_at).toLocaleDateString(
                                                    locale === 'ar' ? 'ar-JO' : 'en-JO'
                                                )}
                                            </td>
                                            <td className="py-3">{amount.toFixed(2)} JOD</td>
                                            <td className="py-3 text-error">-{fee.toFixed(2)}</td>
                                            <td className="py-3 font-medium text-success">{net.toFixed(2)} JOD</td>
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
