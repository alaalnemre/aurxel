import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { StoreProducts } from './StoreProducts';
import { getFeaturedStores, getFeaturedProducts } from '@/actions/featured';
import Link from 'next/link';
import { getProfileBadges, ProfileBadgeWithDetails } from '@/actions/badges';

export const runtime = 'nodejs';

export default async function StorePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const supabase = await createClient();

    // Fetch featured stores and products (graceful fallback if fails)
    const [featuredStoresResult, featuredProductsResult] = await Promise.all([
        getFeaturedStores().catch(() => ({ success: false, data: [] })),
        getFeaturedProducts().catch(() => ({ success: false, data: [] })),
    ]);

    const featuredStores = featuredStoresResult.data || [];
    const featuredProducts = featuredProductsResult.data || [];

    const { data: products, error } = await supabase
        .from('products')
        .select(`*, sellers(store_name, profile_id)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[StorePage] Error:', error);
    }

    // --- Batch Fetch Seller Badges ---
    // 1. Collect all unique seller profile IDs from featured and regular products
    const sellerProfileIds = new Set<string>();

    featuredStores.forEach(s => {
        // We need profile_id for featured stores too
        // The getFeaturedStores action might not returned it yet, let's check
    });

    // To be safe and efficient, let's fetch profile IDs for featured stores 
    // or adjust getFeaturedStores. For now, let's get them from the products list.
    products?.forEach(p => {
        if (p.sellers?.profile_id) sellerProfileIds.add(p.sellers.profile_id);
    });

    // Also include featured stores if we can find their profile IDs
    const featuredSellerIds = featuredStores.map(s => s.sellerId);
    if (featuredSellerIds.length > 0) {
        const { data: featuredSellers } = await supabase
            .from('sellers')
            .select('profile_id')
            .in('id', featuredSellerIds);

        featuredSellers?.forEach(s => {
            if (s.profile_id) sellerProfileIds.add(s.profile_id);
        });
    }

    // 2. Fetch badges for all unique profile IDs
    const sellerBadgesMap: Record<string, ProfileBadgeWithDetails[]> = {};
    if (sellerProfileIds.size > 0) {
        const { data: allBadges, error: badgeError } = await supabase
            .from('profile_badges')
            .select(`
                profile_id,
                id,
                awarded_at,
                awarded_reason,
                badges!inner(key, title_en, title_ar, description_en, description_ar, icon, is_active)
            `)
            .in('profile_id', Array.from(sellerProfileIds))
            .eq('badges.is_active', true);

        if (!badgeError && allBadges) {
            allBadges.forEach(pb => {
                if (!sellerBadgesMap[pb.profile_id]) {
                    sellerBadgesMap[pb.profile_id] = [];
                }
                const badge = pb.badges as any;
                sellerBadgesMap[pb.profile_id].push({
                    id: pb.id,
                    badgeKey: badge.key,
                    titleEn: badge.title_en,
                    titleAr: badge.title_ar,
                    descriptionEn: badge.description_en,
                    descriptionAr: badge.description_ar,
                    icon: badge.icon,
                    awardedAt: pb.awarded_at,
                    awardedReason: pb.awarded_reason,
                });
            });
        }
    }

    // Helper to get profile_id for featured stores (cached/mapped)
    const { data: featuredSellersMapping } = await supabase
        .from('sellers')
        .select('id, profile_id')
        .in('id', featuredSellerIds);

    const featuredProfileMap: Record<string, string> = {};
    featuredSellersMapping?.forEach(s => {
        featuredProfileMap[s.id] = s.profile_id;
    });

    return (
        <div>
            <PageHeader title={t('store.title')} description={t('store.subtitle')} />

            {/* Featured Stores Section */}
            {featuredStores.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-dark">{t('featured.featuredStores')}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {featuredStores.map(store => {
                            const profileId = featuredProfileMap[store.sellerId];
                            const badges = profileId ? sellerBadgesMap[profileId] : [];

                            return (
                                <Link
                                    key={store.id}
                                    href={`/${locale}/store?seller=${store.sellerId}`}
                                    className="group bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                                >
                                    <div className="relative bg-gradient-to-br from-primary-soft to-info-soft p-4 aspect-[4/3] flex items-center justify-center">
                                        {store.imageOverride || store.logoUrl ? (
                                            <img
                                                src={store.imageOverride || store.logoUrl!}
                                                alt={store.titleOverride || store.storeName}
                                                className="w-16 h-16 rounded-xl object-cover bg-white"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary">
                                                    {store.storeName.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <span className="absolute top-2 end-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                            {t('featured.featured')}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-dark group-hover:text-primary transition-colors truncate">
                                                {store.titleOverride || store.storeName}
                                            </h3>

                                            {badges && badges.length > 0 && (
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {badges.slice(0, 2).map(b => (
                                                        <span key={b.id} title={locale === 'ar' ? b.titleAr : b.titleEn} className="text-sm">
                                                            {b.icon}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {(store.subtitleOverride || store.storeCity) && (
                                            <p className="text-sm text-gray-500 truncate mt-1">
                                                {store.subtitleOverride || store.storeCity}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Featured Products Section (Similar Badge Logic could be added here if needed, but ProductCard handles it) */}
            {/* ... featured products section ... */}
            {/* Note: I'll need to figure out how to pass badges to products in Featured Products Section since they are rendered as Link here directly instead of ProductCard ... actually I should probably use ProductCard there too for consistency or manually add badges. For now I'll just pass the map to StoreProducts */}

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-dark">{t('featured.featuredProducts')}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {featuredProducts.map(product => {
                            // Find badges for this product's seller
                            // We don't have profile_id in featuredProducts either, let's fetch it too or assume it's in our map if we fetched it
                            const profileId = product.sellerId ? featuredProfileMap[product.sellerId] : null;
                            const badges = profileId ? sellerBadgesMap[profileId] : [];

                            return (
                                <Link
                                    key={product.id}
                                    href={`/${locale}/product/${product.productId}`}
                                    className="group bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        {product.imageOverride || product.productImage ? (
                                            <img
                                                src={product.imageOverride || product.productImage!}
                                                alt={product.titleOverride || product.productTitle}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className="absolute top-2 end-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                            {t('featured.featured')}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-dark group-hover:text-primary transition-colors truncate">
                                                {product.titleOverride || product.productTitle}
                                            </h3>
                                            {badges && badges.length > 0 && (
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {badges.slice(0, 2).map(b => (
                                                        <span key={b.id} title={locale === 'ar' ? b.titleAr : b.titleEn} className="text-sm">
                                                            {b.icon}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {product.subtitleOverride || product.sellerName}
                                        </p>
                                        <p className="text-lg font-bold text-primary mt-2">
                                            {product.productPrice.toFixed(2)} {t('common.currency')}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All Products */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-dark">{t('store.allProducts')}</h2>
                </div>
                {products && products.length > 0 ? (
                    <StoreProducts products={products as any} locale={locale} sellerBadgesMap={sellerBadgesMap} />
                ) : (
                    <EmptyState
                        iconType="products"
                        title={t('store.noProducts')}
                    />
                )}
            </section>
        </div>
    );
}
