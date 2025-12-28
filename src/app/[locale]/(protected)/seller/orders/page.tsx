import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { SellerOrderActions } from './SellerOrderActions';

export const runtime = 'nodejs';

export default async function SellerOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) redirect(`/${locale}/become-seller`);

    const supabase = await createClient();
    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!seller) redirect(`/${locale}/become-seller`);

    const { data: orders } = await supabase
        .from('orders')
        .select(`*, order_items(*), profiles(full_name)`)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    return (
        <div>
            <PageHeader title={t('seller.orders')} />

            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const buyer = order.profiles as { full_name: string | null } | null;
                        const items = (order.order_items as Array<{ title_snapshot: string; quantity: number }>) || [];
                        return (
                            <Card key={order.id}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium">{t('orders.orderNumber')}{order.id.slice(0, 8)}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-sm text-gray-500">{buyer?.full_name || 'Customer'} • {new Date(order.created_at).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-500">{items.map(i => `${i.title_snapshot} ×${i.quantity}`).join(', ')}</p>
                                        <p className="font-bold text-primary-600 mt-1">{order.total.toFixed(2)} {t('common.currency')}</p>
                                    </div>
                                    <SellerOrderActions orderId={order.id} status={order.status} />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState title={t('seller.noOrders')} description={t('seller.waitingForOrders')} />
            )}
        </div>
    );
}
