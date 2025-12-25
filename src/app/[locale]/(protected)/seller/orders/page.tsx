import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSellerOrders } from '@/lib/orders/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SellerOrdersPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const orders = await getSellerOrders();

    return <SellerOrdersContent orders={orders} locale={locale} />;
}

function SellerOrdersContent({
    orders,
    locale,
}: {
    orders: Awaited<ReturnType<typeof getSellerOrders>>;
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

    const newOrders = orders.filter((o) => o.status === 'placed');
    const activeOrders = orders.filter((o) =>
        ['accepted', 'preparing', 'ready_for_pickup'].includes(o.status)
    );
    const completedOrders = orders.filter((o) =>
        ['delivered', 'cancelled'].includes(o.status)
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('orders.sellerOrders')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('orders.manageOrders')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('orders.newOrders')}</div>
                    <div className="text-2xl font-bold text-blue-600">{newOrders.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('orders.inProgress')}</div>
                    <div className="text-2xl font-bold text-yellow-600">{activeOrders.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('orders.completed')}</div>
                    <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orders.noSellerOrders')}</h3>
                    <p className="text-gray-500">{t('orders.waitingForOrders')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* New Orders Alert */}
                    {newOrders.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 font-medium">
                                🔔 {t('orders.youHaveNewOrders', { count: newOrders.length })}
                            </p>
                        </div>
                    )}

                    {/* Orders List */}
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/seller/orders/${order.id}`}
                            className={`block bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${order.status === 'placed' ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.orderId')}: #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleString(locale)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                                    {t(`orders.status.${order.status}`)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {order.items?.length || 0} {t('orders.items')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.buyerName')}: {(order.buyer as { full_name?: string } | null)?.full_name || 'Buyer'}
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-indigo-600">
                                    {order.total_amount.toFixed(2)} JOD
                                </p>
                            </div>

                            {order.status === 'placed' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-sm text-blue-600 font-medium">
                                        {t('orders.clickToAccept')} →
                                    </span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
