import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag } from 'lucide-react';

interface BuyerShopPageProps {
    params: Promise<{ locale: string }>;
}

export default async function BuyerShopPage({ params }: BuyerShopPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();

    // Get active products
    const { data: products } = await supabase
        .from('products')
        .select('*, sellers(business_name)')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(20);

    // Get categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('sort_order');

    const t = {
        title: locale === 'ar' ? 'المتجر' : 'Shop',
        search: locale === 'ar' ? 'ابحث عن منتجات...' : 'Search products...',
        categories: locale === 'ar' ? 'التصنيفات' : 'Categories',
        noProducts: locale === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available',
        noProductsDesc: locale === 'ar'
            ? 'تحقق لاحقاً للمنتجات الجديدة'
            : 'Check back later for new products',
        from: locale === 'ar' ? 'من' : 'from',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t.search} className="pl-10" />
                </div>
            </div>

            {/* Categories */}
            {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        {locale === 'ar' ? 'الكل' : 'All'}
                    </Badge>
                    {categories.map((cat) => (
                        <Badge key={cat.id} variant="outline" className="cursor-pointer hover:bg-muted">
                            {locale === 'ar' ? cat.name_ar : cat.name_en}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            {!products || products.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.noProducts}</h3>
                        <p className="text-muted-foreground text-sm">{t.noProductsDesc}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-muted flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold truncate">
                                    {locale === 'ar' ? product.title_ar : product.title_en}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {t.from} {(product.sellers as { business_name: string })?.business_name || 'Unknown'}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="font-bold">{Number(product.price).toFixed(2)} JOD</p>
                                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {Number(product.compare_at_price).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
