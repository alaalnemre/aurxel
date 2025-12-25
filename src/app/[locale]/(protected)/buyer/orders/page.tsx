import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBuyerOrders } from '@/lib/orders/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function BuyerOrdersPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const orders = await getBuyerOrders();

    return <BuyerOrdersContent orders={orders} locale={locale} />;
}

function BuyerOrdersContent({
    orders,
    locale,
}: {
    orders: Awaited<ReturnType<typeof getBuyerOrders>>;
    locale: string;
}) {
    const t = useTranslations();

    const statusColors: Record<string, string> = {
        placed: 'bg-blue-100 text-blue-700',
        accepted: 'bg-indigo-100 text-indigo-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready_for_pickup: 'bg-purple-100 text-purple-700',
        assigned: 'bg-cyan-100 text-cyan-700',
        picked_up: 'bg-orange-100 text-orange-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('orders.myOrders')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('orders.trackOrders')}</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orders.noOrders')}</h3>
                    <p className="text-gray-500 mb-6">{t('orders.startShopping')}</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                    >
                        {t('orders.browseProducts')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/buyer/orders/${order.id}`}
                            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.orderId')}: #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString(locale)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {t(`orders.status.${order.status}`)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {order.items?.length || 0} {t('orders.items')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.sellerFrom')}: {(order.seller as { full_name?: string } | null)?.full_name || 'Seller'}
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-indigo-600">
                                    {order.total_amount.toFixed(2)} JOD
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
