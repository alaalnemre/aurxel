import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState, StatCard } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { getAdminFeatured, disableFeaturedEntity, enableFeaturedEntity, deleteFeaturedEntity } from '@/actions/featured';
import Link from 'next/link';

export const runtime = 'nodejs';

// Helper to determine status
function getFeaturedStatus(item: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
    const now = new Date();
    if (!item.is_active) return 'inactive';
    if (item.starts_at && new Date(item.starts_at) > now) return 'scheduled';
    if (item.ends_at && new Date(item.ends_at) < now) return 'expired';
    return 'active';
}

export default async function AdminFeaturedPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get featured entities with related data
    const result = await getAdminFeatured();
    const featured = result.data || [];

    // Get sellers and products for display
    const sellerIds = featured.filter(f => f.seller_id).map(f => f.seller_id!);
    const productIds = featured.filter(f => f.product_id).map(f => f.product_id!);

    const [sellersRes, productsRes] = await Promise.all([
        sellerIds.length > 0
            ? supabase.from('sellers').select('id, store_name').in('id', sellerIds)
            : { data: [] },
        productIds.length > 0
            ? supabase.from('products').select('id, title').in('id', productIds)
            : { data: [] },
    ]);

    const sellerMap = new Map((sellersRes.data || []).map(s => [s.id, s.store_name]));
    const productMap = new Map((productsRes.data || []).map(p => [p.id, p.title]));

    // Stats
    const activeCount = featured.filter(f => getFeaturedStatus(f) === 'active').length;
    const storeCount = featured.filter(f => f.entity_type === 'store').length;
    const productCount = featured.filter(f => f.entity_type === 'product').length;

    return (
        <div>
            <PageHeader
                title={t('featured.title')}
                description={t('featured.subtitle')}
                action={
                    <Link href={`/${locale}/admin/featured/new`}>
                        <Button>{t('featured.addNew')}</Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title={t('featured.active')}
                    value={activeCount}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('featured.store')}
                    value={storeCount}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('featured.product')}
                    value={productCount}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
            </div>

            {/* Featured Table */}
            {featured.length > 0 ? (
                <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('featured.type')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('featured.entity')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('featured.priority')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('featured.status')}</th>
                                    <th className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('featured.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {featured.map(item => {
                                    const status = getFeaturedStatus(item);
                                    const entityName = item.entity_type === 'store'
                                        ? item.title_override || sellerMap.get(item.seller_id!) || 'Unknown'
                                        : item.title_override || productMap.get(item.product_id!) || 'Unknown';

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.entity_type === 'store'
                                                        ? 'bg-info-soft text-info'
                                                        : 'bg-primary-soft text-primary'
                                                    }`}>
                                                    {t(`featured.${item.entity_type}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-dark">
                                                {entityName}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.priority}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-success-soft text-success' :
                                                        status === 'scheduled' ? 'bg-warning-soft text-warning' :
                                                            status === 'expired' ? 'bg-error-soft text-error' :
                                                                'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {t(`featured.${status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-end">
                                                <div className="flex items-center justify-end gap-2">
                                                    <form action={async () => {
                                                        'use server';
                                                        if (item.is_active) {
                                                            await disableFeaturedEntity(item.id);
                                                        } else {
                                                            await enableFeaturedEntity(item.id);
                                                        }
                                                    }}>
                                                        <Button type="submit" variant="ghost" size="sm">
                                                            {item.is_active ? t('discounts.disable') : t('discounts.enable')}
                                                        </Button>
                                                    </form>
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteFeaturedEntity(item.id);
                                                    }}>
                                                        <Button type="submit" variant="ghost" size="sm" className="text-error hover:text-error">
                                                            {t('common.delete')}
                                                        </Button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState
                    iconType="products"
                    title={t('featured.noFeatured')}
                    description={t('featured.noFeaturedDesc')}
                    action={
                        <Link href={`/${locale}/admin/featured/new`}>
                            <Button>{t('featured.addNew')}</Button>
                        </Link>
                    }
                />
            )}
        </div>
    );
}
