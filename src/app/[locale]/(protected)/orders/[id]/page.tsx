import { getTranslations } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderActions } from './OrderActions';

export const runtime = 'nodejs';

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    const t = await getTranslations();
    const supabase = await createClient();
    const user = await getUser();

    if (!user) return null;

    const { data: order } = await supabase
        .from('orders')
        .select(`*, sellers(store_name, store_address, store_city), order_items(*)`)
        .eq('id', id)
        .eq('buyer_profile_id', user.id)
        .maybeSingle();

    if (!order) notFound();

    const { data: delivery } = await supabase
        .from('deliveries')
        .select(`*, drivers(profiles(full_name))`)
        .eq('order_id', id)
        .maybeSingle();

    const seller = order.sellers as { store_name: string; store_address: string | null; store_city: string | null } | null;
    const items = (order.order_items as Array<{ title_snapshot: string; quantity: number; line_total: number }>) || [];

    return (
        <div className="max-w-3xl mx-auto">
            <Link href={`/${locale}/orders`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">← {t('common.back')}</Link>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{t('orders.orderNumber')}{order.id.slice(0, 8)}</h1>
                    <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="grid gap-6">
                <Card>
                    <h2 className="font-semibold mb-4">{t('orders.items')}</h2>
                    <div className="divide-y">
                        {items.map((item, idx) => (
                            <div key={idx} className="py-3 flex justify-between">
                                <span>{item.title_snapshot} × {item.quantity}</span>
                                <span className="font-medium">{item.line_total.toFixed(2)} {t('common.currency')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-3 mt-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{order.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>{t('cart.deliveryFee')}</span><span>{order.delivery_fee.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2"><span>{t('cart.total')}</span><span>{order.total.toFixed(2)} {t('common.currency')}</span></div>
                    </div>
                </Card>

                <Card>
                    <h2 className="font-semibold mb-4">{t('checkout.deliveryAddress')}</h2>
                    <p>{order.address}</p>
                    <p>{order.city}</p>
                    <p>{order.phone}</p>
                </Card>

                {seller && (
                    <Card>
                        <h2 className="font-semibold mb-4">{t('product.soldBy')}</h2>
                        <p className="font-medium">{seller.store_name}</p>
                        <p className="text-sm text-gray-500">{seller.store_address}, {seller.store_city}</p>
                    </Card>
                )}

                {delivery && (
                    <Card>
                        <h2 className="font-semibold mb-4">{t('orders.delivery')}</h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">{t('orders.status')}</p>
                                <StatusBadge status={delivery.status} type="delivery" />
                            </div>
                            {delivery.drivers && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Driver</p>
                                    <p className="font-medium">{(delivery.drivers as { profiles: { full_name: string } })?.profiles?.full_name}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                <OrderActions orderId={order.id} status={order.status} locale={locale} />
            </div>
        </div>
    );
}
