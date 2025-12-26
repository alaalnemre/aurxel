import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string; category?: string; min?: string; max?: string; sort?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('product');

    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('products')
        .select(`
      id,
      name_en,
      name_ar,
      price,
      compare_at_price,
      images,
      stock,
      seller_id
    `)
        .eq('is_active', true)
        .gt('stock', 0);

    // Search filter
    if (search.q) {
        query = query.or(`name_en.ilike.%${search.q}%,name_ar.ilike.%${search.q}%`);
    }

    // Category filter
    if (search.category) {
        query = query.eq('category_id', search.category);
    }

    // Price filters
    if (search.min) {
        query = query.gte('price', parseFloat(search.min));
    }
    if (search.max) {
        query = query.lte('price', parseFloat(search.max));
    }

    // Sorting
    switch (search.sort) {
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        default:
            query = query.order('created_at', { ascending: false });
    }

    const { data: products } = await query.limit(24);

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name_en, name_ar, slug')
        .eq('is_active', true);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                            </h1>
                            {search.q && (
                                <p className="text-secondary mt-1">
                                    {locale === 'ar' ? `نتائج البحث عن "${search.q}"` : `Results for "${search.q}"`}
                                </p>
                            )}
                        </div>
                        <ProductFilters
                            locale={locale}
                            categories={categories || []}
                            currentFilters={search}
                        />
                    </div>

                    {/* Products Grid */}
                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    locale={locale}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🔍</div>
                            <h2 className="text-xl font-semibold mb-2">
                                {locale === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                            </h2>
                            <p className="text-secondary mb-4">
                                {locale === 'ar'
                                    ? 'جرب تغيير معايير البحث'
                                    : 'Try adjusting your search criteria'}
                            </p>
                            <Link
                                href={`/${locale}/products`}
                                className="text-primary hover:underline"
                            >
                                {locale === 'ar' ? 'عرض كل المنتجات' : 'View all products'}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
