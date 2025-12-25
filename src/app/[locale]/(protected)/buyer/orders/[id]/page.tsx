import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getBuyerOrder } from '@/lib/orders/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function BuyerOrderDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const order = await getBuyerOrder(id);

    if (!order) {
        notFound();
    }

    return <OrderDetailContent order={order} locale={locale} />;
}

function OrderDetailContent({
    order,
    locale,
}: {
    order: NonNullable<Awaited<ReturnType<typeof getBuyerOrder>>>;
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

    const statusSteps = [
        'placed',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'assigned',
        'picked_up',
        'delivered',
    ];

    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/buyer/orders"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
                    >
                        ← {t('common.back')}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('orders.orderId')}: #{order.id.slice(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString(locale)}
                    </p>
                </div>
                <span className={`px-4 py-2 text-sm font-medium rounded-full ${statusColors[order.status]}`}>
                    {t(`orders.status.${order.status}`)}
                </span>
            </div>

            {/* Status Progress */}
            {order.status !== 'cancelled' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('orders.orderProgress')}
                    </h2>
                    <div className="flex items-center">
                        {statusSteps.slice(0, -1).map((step, index) => (
                            <div key={step} className="flex-1 flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index <= currentStepIndex
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {index < currentStepIndex ? '✓' : index + 1}
                                </div>
                                {index < statusSteps.length - 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex mt-2">
                        {statusSteps.slice(0, -1).map((step) => (
                            <div key={step} className="flex-1 text-xs text-center text-gray-500">
                                {t(`orders.status.${step}`)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('orders.orderItems')}
                </h2>
                <div className="divide-y divide-gray-200">
                    {order.items?.map((item) => (
                        <div key={item.id} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">
                                    {locale === 'ar' && item.product_name_ar
                                        ? item.product_name_ar
                                        : item.product_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.quantity} × {item.unit_price.toFixed(2)} JOD
                                </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {item.total_price.toFixed(2)} JOD
                            </p>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>{t('orders.total')}</span>
                        <span className="text-indigo-600">{order.total_amount.toFixed(2)} JOD</span>
                    </div>
                </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('orders.deliveryInfo')}
                </h2>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-500">{t('checkout.address')}</p>
                        <p className="text-gray-900">{order.delivery_address || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{t('checkout.phone')}</p>
                        <p className="text-gray-900">{order.delivery_phone || '-'}</p>
                    </div>
                    {order.delivery_notes && (
                        <div>
                            <p className="text-sm text-gray-500">{t('checkout.notes')}</p>
                            <p className="text-gray-900">{order.delivery_notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('checkout.paymentMethod')}
                </h2>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        💵
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{t('checkout.cod')}</p>
                        <p className="text-sm text-gray-500">{t('checkout.codDescription')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
