import { getTranslations } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const runtime = 'nodejs';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const supabase = await createClient();
    const user = await getUser();

    if (!user) return null;

    const { data: orders } = await supabase
        .from('orders')
        .select(`*, sellers(store_name)`)
        .eq('buyer_profile_id', user.id)
        .order('created_at', { ascending: false });

    const items = orders || [];

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title={t('orders.title')} />

            {items.length > 0 ? (
                <div className="space-y-4">
                    {items.map((order) => (
                        <Card key={order.id} hover>
                            <Link href={`/${locale}/orders/${order.id}`} className="block">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{t('orders.orderNumber')}{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">{(order.sellers as { store_name: string })?.store_name}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={order.status} />
                                        <p className="font-bold text-gray-900 mt-2">{order.total.toFixed(2)} {t('common.currency')}</p>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    title={t('orders.empty')}
                    description={t('orders.emptyMessage')}
                    action={<Link href={`/${locale}/store`}><Button>{t('cart.continueShopping')}</Button></Link>}
                />
            )}
        </div>
    );
}
