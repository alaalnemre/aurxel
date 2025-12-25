import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getDeliveryDetails } from '@/lib/deliveries/actions';
import { DeliveryStatusActions } from '@/components/driver/DeliveryStatusActions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DriverDeliveryDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const delivery = await getDeliveryDetails(id);

    if (!delivery) {
        notFound();
    }

    return <DeliveryDetailContent delivery={delivery} locale={locale} />;
}

function DeliveryDetailContent({
    delivery,
    locale,
}: {
    delivery: NonNullable<Awaited<ReturnType<typeof getDeliveryDetails>>>;
    locale: string;
}) {
    const t = useTranslations();

    const statusColors: Record<string, string> = {
        available: 'bg-green-100 text-green-700',
        assigned: 'bg-blue-100 text-blue-700',
        picked_up: 'bg-yellow-100 text-yellow-700',
        delivered: 'bg-purple-100 text-purple-700',
    };

    const order = delivery.order;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/driver/deliveries"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
                    >
                        ← {t('common.back')}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('delivery.deliveryDetails')}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {t('orders.orderId')}: #{order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                    </p>
                </div>
                <span
                    className={`px-4 py-2 text-sm font-medium rounded-full ${statusColors[delivery.status]
                        }`}
                >
                    {t(`delivery.status.${delivery.status}`)}
                </span>
            </div>

            {/* Status Actions */}
            <DeliveryStatusActions
                deliveryId={delivery.id}
                currentStatus={delivery.status}
            />

            {/* Delivery Info */}
            {order && (
                <>
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('delivery.customerInfo')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('orders.buyerName')}</p>
                                <p className="text-gray-900 font-medium">
                                    {(order.buyer as { full_name?: string } | null)?.full_name ||
                                        'Customer'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('checkout.phone')}</p>
                                <p className="text-gray-900 font-medium">
                                    {order.delivery_phone || '-'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">{t('checkout.address')}</p>
                                <p className="text-gray-900 font-medium">
                                    {order.delivery_address || '-'}
                                </p>
                            </div>
                            {order.delivery_notes && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">{t('checkout.notes')}</p>
                                    <p className="text-gray-900">{order.delivery_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pickup Location (Seller) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('delivery.pickupLocation')}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                    {((order.seller as { full_name?: string } | null)?.full_name ||
                                        'S')[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {(order.seller as { full_name?: string } | null)?.full_name ||
                                        'Seller'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {t('delivery.contactSeller')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('orders.orderItems')}
                        </h2>
                        <div className="divide-y divide-gray-200">
                            {order.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="py-3 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {locale === 'ar' && item.product_name_ar
                                                ? item.product_name_ar
                                                : item.product_name}
                                        </p>
                                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {item.total_price.toFixed(2)} JOD
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>{t('delivery.collectAmount')}</span>
                                <span className="text-green-600">
                                    {order.total_amount.toFixed(2)} JOD
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('delivery.codNote')}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('delivery.timeline')}
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${delivery.status !== 'available'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            ✓
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {t('delivery.status.assigned')}
                            </p>
                            {delivery.assigned_at && (
                                <p className="text-sm text-gray-500">
                                    {new Date(delivery.assigned_at).toLocaleString(locale)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${['picked_up', 'delivered'].includes(delivery.status)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {['picked_up', 'delivered'].includes(delivery.status) ? '✓' : '2'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {t('delivery.status.picked_up')}
                            </p>
                            {delivery.picked_up_at && (
                                <p className="text-sm text-gray-500">
                                    {new Date(delivery.picked_up_at).toLocaleString(locale)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${delivery.status === 'delivered'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {delivery.status === 'delivered' ? '✓' : '3'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {t('delivery.status.delivered')}
                            </p>
                            {delivery.delivered_at && (
                                <p className="text-sm text-gray-500">
                                    {new Date(delivery.delivered_at).toLocaleString(locale)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
