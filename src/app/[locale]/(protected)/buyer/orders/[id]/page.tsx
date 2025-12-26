import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('order');
    const tStatus = await getTranslations('order.status');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: order } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(
        id,
        quantity,
        unit_price,
        product:products(id, name_en, name_ar, images)
      ),
      delivery:deliveries(*)
    `)
        .eq('id', id)
        .eq('buyer_id', user?.id)
        .maybeSingle();

    if (!order) {
        notFound();
    }

    const statusSteps = [
        { key: 'placed', icon: '📝', label: tStatus('placed') },
        { key: 'accepted', icon: '✅', label: tStatus('accepted') },
        { key: 'preparing', icon: '👨‍🍳', label: tStatus('preparing') },
        { key: 'ready', icon: '📦', label: tStatus('ready') },
        { key: 'picked_up', icon: '🛵', label: tStatus('pickedUp') },
        { key: 'delivered', icon: '🎉', label: tStatus('delivered') },
    ];

    const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/${locale}/buyer/orders`}
                        className="text-sm text-secondary hover:text-primary flex items-center gap-1 mb-2"
                    >
                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {locale === 'ar' ? 'رجوع للطلبات' : 'Back to Orders'}
                    </Link>
                    <h1 className="text-2xl font-bold">{t('details')}</h1>
                    <p className="text-secondary font-mono">#{order.id.slice(0, 8)}</p>
                </div>
                <StatusBadge status={order.status} t={tStatus} />
            </div>

            {/* Timeline */}
            {!isCancelled && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-6">{t('timeline')}</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                        <div className="space-y-6">
                            {statusSteps.map((step, idx) => {
                                const isCompleted = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;
                                return (
                                    <div key={step.key} className="relative flex items-start gap-4">
                                        <div
                                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-lg ${isCompleted
                                                    ? 'bg-primary text-white'
                                                    : 'bg-muted text-secondary'
                                                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                                        >
                                            {step.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className={`font-medium ${isCompleted ? '' : 'text-secondary'}`}>
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-sm text-primary">
                                                    {locale === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isCancelled && (
                <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center">
                    <span className="text-4xl mb-2 block">❌</span>
                    <p className="text-error font-semibold">{tStatus('cancelled')}</p>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">{t('items')}</h2>
                <div className="space-y-4">
                    {order.items?.map((item: {
                        id: string;
                        quantity: number;
                        unit_price: number;
                        product: { id: string; name_en: string; name_ar: string; images: string[] } | { id: string; name_en: string; name_ar: string; images: string[] }[] | null;
                    }) => {
                        const product = Array.isArray(item.product) ? item.product[0] : item.product;
                        if (!product) return null;

                        return (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={locale === 'ar' ? product.name_ar : product.name_en}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">
                                            📦
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {locale === 'ar' ? product.name_ar : product.name_en}
                                    </p>
                                    <p className="text-sm text-secondary">
                                        {item.quantity} × {Number(item.unit_price).toFixed(2)} JOD
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {(item.quantity * Number(item.unit_price)).toFixed(2)} JOD
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Totals */}
                <div className="border-t border-border mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-secondary">
                            {locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                        </span>
                        <span>{Number(order.total_amount).toFixed(2)} JOD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-secondary">
                            {locale === 'ar' ? 'التوصيل' : 'Delivery'}
                        </span>
                        <span>{Number(order.delivery_fee).toFixed(2)} JOD</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-border">
                        <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                        <span className="text-primary">
                            {(Number(order.total_amount) + Number(order.delivery_fee)).toFixed(2)} JOD
                        </span>
                    </div>
                </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4">
                    {locale === 'ar' ? 'معلومات التوصيل' : 'Delivery Info'}
                </h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">📍</span>
                        <div>
                            <p className="font-medium">
                                {locale === 'ar' ? 'العنوان' : 'Address'}
                            </p>
                            <p className="text-secondary">{order.delivery_address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-xl">📱</span>
                        <div>
                            <p className="font-medium">
                                {locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
                            </p>
                            <p className="text-secondary">{order.delivery_phone}</p>
                        </div>
                    </div>
                    {order.notes && (
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📝</span>
                            <div>
                                <p className="font-medium">
                                    {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                                </p>
                                <p className="text-secondary">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusColors[status] || 'bg-gray-100'}`}>
            {t(statusKey)}
        </span>
    );
}
