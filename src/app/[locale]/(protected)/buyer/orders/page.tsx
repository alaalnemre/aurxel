import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function BuyerOrdersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ success?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('order.status');
    const tBuyer = await getTranslations('buyer');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount, delivery_fee, created_at')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Success Message */}
            {search.success && (
                <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                        <p className="font-semibold">
                            {locale === 'ar' ? 'تم الطلب بنجاح!' : 'Order Placed Successfully!'}
                        </p>
                        <p className="text-sm">
                            {locale === 'ar'
                                ? 'سيتم التواصل معك قريباً'
                                : 'You will be contacted soon'}
                        </p>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold">{tBuyer('myOrders')}</h1>

            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/${locale}/buyer/orders/${order.id}`}
                            className="block bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-sm text-secondary">
                                            #{order.id.slice(0, 8)}
                                        </span>
                                        <StatusBadge status={order.status} t={t} />
                                    </div>
                                    <p className="text-sm text-secondary">
                                        {new Date(order.created_at).toLocaleDateString(
                                            locale === 'ar' ? 'ar-JO' : 'en-JO',
                                            { dateStyle: 'long' }
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">
                                        {(Number(order.total_amount) + Number(order.delivery_fee)).toFixed(2)} JOD
                                    </p>
                                    <p className="text-xs text-secondary">
                                        {locale === 'ar' ? 'شامل التوصيل' : 'incl. delivery'}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <OrderProgress status={order.status} locale={locale} />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl">
                    <div className="text-5xl mb-4">📦</div>
                    <h2 className="text-xl font-semibold mb-2">{tBuyer('noOrders')}</h2>
                    <p className="text-secondary mb-6">
                        {locale === 'ar'
                            ? 'لم تقم بأي طلبات بعد'
                            : "You haven't placed any orders yet"}
                    </p>
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                        {tBuyer('startShopping')}
                    </Link>
                </div>
            )}
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

    const statusKey = status.replace('_', '');

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[status] || 'bg-gray-100'}`}>
            {t(statusKey)}
        </span>
    );
}

function OrderProgress({ status, locale }: { status: string; locale: string }) {
    const steps = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];
    const currentIndex = steps.indexOf(status);
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
        return (
            <div className="text-center text-error text-sm">
                {locale === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled'}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {steps.map((step, idx) => (
                <div key={step} className="flex-1 flex items-center">
                    <div
                        className={`flex-1 h-1.5 rounded-full transition-colors ${idx <= currentIndex ? 'bg-primary' : 'bg-muted'
                            }`}
                    />
                </div>
            ))}
        </div>
    );
}
