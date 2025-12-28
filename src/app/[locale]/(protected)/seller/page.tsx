import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard, EmptyState } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const runtime = 'nodejs';

export default async function SellerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) {
        redirect(`/${locale}/become-seller`);
    }

    const supabase = await createClient();

    const { data: seller } = await supabase.from('sellers').select('id, store_name').eq('profile_id', profile.id).maybeSingle();
    if (!seller) redirect(`/${locale}/become-seller`);

    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id);
    const { data: orders } = await supabase.from('orders').select('id, total, status').eq('seller_id', seller.id);

    const totalOrders = orders?.length || 0;
    const totalSales = orders?.reduce((sum, o) => sum + (o.status === 'completed' ? Number(o.total) : 0), 0) || 0;
    const pendingOrders = orders?.filter(o => ['placed', 'accepted', 'preparing'].includes(o.status)).length || 0;

    return (
        <div>
            <PageHeader
                title={`${t('seller.welcome')}, ${seller.store_name}`}
                action={<Link href={`/${locale}/seller/products/new`}><Button>{t('seller.addProduct')}</Button></Link>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('seller.totalSales')} value={`${totalSales.toFixed(2)} ${t('common.currency')}`} />
                <StatCard title={t('seller.totalOrders')} value={totalOrders} />
                <StatCard title={t('seller.pendingOrders')} value={pendingOrders} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href={`/${locale}/seller/products`} className="bg-white rounded-xl p-6 border hover:border-primary-300 transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{t('seller.products')}</h3>
                    <p className="text-gray-500">{productCount || 0} products</p>
                </Link>
                <Link href={`/${locale}/seller/orders`} className="bg-white rounded-xl p-6 border hover:border-primary-300 transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{t('seller.orders')}</h3>
                    <p className="text-gray-500">{pendingOrders} pending</p>
                </Link>
            </div>
        </div>
    );
}
