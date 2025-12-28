import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const runtime = 'nodejs';

export default async function BuyerFavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get frequently ordered stores (based on order history)
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            seller_id,
            total,
            sellers!inner(id, store_name, description, logo_url, store_city)
        `)
        .eq('buyer_profile_id', profile.id);

    // Calculate store rankings
    const storeStats: Record<string, {
        id: string;
        name: string;
        description: string | null;
        logo: string | null;
        city: string | null;
        orderCount: number;
        totalSpend: number;
    }> = {};

    orders?.forEach(order => {
        const sellerId = order.seller_id;
        const sellerData = order.sellers as unknown as {
            id: string;
            store_name: string;
            description: string | null;
            logo_url: string | null;
            store_city: string | null;
        } | null;

        if (!sellerData) return;

        if (!storeStats[sellerId]) {
            storeStats[sellerId] = {
                id: sellerData.id,
                name: sellerData.store_name,
                description: sellerData.description,
                logo: sellerData.logo_url,
                city: sellerData.store_city,
                orderCount: 0,
                totalSpend: 0,
            };
        }
        storeStats[sellerId].orderCount += 1;
        storeStats[sellerId].totalSpend += Number(order.total);
    });

    const favoriteStores = Object.values(storeStats)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 10);

    return (
        <div>
            <PageHeader
                title={t('buyer.favoritesTitle')}
                description={t('buyer.favoritesSubtitle')}
            />

            {favoriteStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteStores.map((store, index) => (
                        <div key={store.id} className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                            {/* Store Header */}
                            <div className="relative bg-gradient-to-br from-primary-soft to-info-soft p-6">
                                {index < 3 && (
                                    <span className={`absolute top-3 end-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                            'bg-orange-400 text-white'
                                        }`}>
                                        {index + 1}
                                    </span>
                                )}
                                <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
                                    {store.logo ? (
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary">{store.name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>

                            {/* Store Info */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-dark mb-1">{store.name}</h3>
                                {store.city && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {store.city}
                                    </p>
                                )}

                                <div className="flex items-center justify-between py-3 border-t border-border">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-dark">{store.orderCount}</p>
                                        <p className="text-xs text-gray-500">{t('buyer.ordersLabel')}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-primary">{store.totalSpend.toFixed(0)}</p>
                                        <p className="text-xs text-gray-500">{t('common.currency')}</p>
                                    </div>
                                </div>

                                <Link href={`/${locale}/store?seller=${store.id}`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        {t('buyer.visitStore')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    iconType="favorites"
                    title={t('buyer.noFavoritesYet')}
                    description={t('buyer.noFavoritesDesc')}
                    action={
                        <Link href={`/${locale}/store`}>
                            <Button>{t('buyer.startShopping')}</Button>
                        </Link>
                    }
                />
            )}
        </div>
    );
}
