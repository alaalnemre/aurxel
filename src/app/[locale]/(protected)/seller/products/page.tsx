import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ProductStatusToggle } from '@/components/seller/ProductStatusToggle';

export default async function SellerProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ status?: string; q?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('seller');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let query = supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

    // Status filter
    if (search.status === 'active') {
        query = query.eq('is_active', true).gt('stock', 0);
    } else if (search.status === 'inactive') {
        query = query.eq('is_active', false);
    } else if (search.status === 'out_of_stock') {
        query = query.eq('stock', 0);
    }

    // Search filter
    if (search.q) {
        query = query.or(`name_en.ilike.%${search.q}%,name_ar.ilike.%${search.q}%`);
    }

    const { data: products } = await query;

    // Get counts for tabs
    const { count: allCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id);

    const { count: activeCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('is_active', true)
        .gt('stock', 0);

    const { count: outOfStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('stock', 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('products')}</h1>
                <Link
                    href={`/${locale}/seller/products/new`}
                    className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    {t('addProduct')}
                </Link>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 flex-wrap">
                    <TabLink
                        href={`/${locale}/seller/products`}
                        active={!search.status}
                        label={locale === 'ar' ? 'الكل' : 'All'}
                        count={allCount || 0}
                    />
                    <TabLink
                        href={`/${locale}/seller/products?status=active`}
                        active={search.status === 'active'}
                        label={locale === 'ar' ? 'نشط' : 'Active'}
                        count={activeCount || 0}
                    />
                    <TabLink
                        href={`/${locale}/seller/products?status=out_of_stock`}
                        active={search.status === 'out_of_stock'}
                        label={locale === 'ar' ? 'نفذ المخزون' : 'Out of Stock'}
                        count={outOfStockCount || 0}
                    />
                </div>
                <form className="flex-1 max-w-md">
                    <input
                        type="search"
                        name="q"
                        defaultValue={search.q || ''}
                        placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none"
                    />
                </form>
            </div>

            {/* Products Table/Grid */}
            {products && products.length > 0 ? (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'السعر' : 'Price'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المخزون' : 'Stock'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate max-w-[200px]">
                                                        {locale === 'ar' ? product.name_ar : product.name_en}
                                                    </p>
                                                    <p className="text-xs text-secondary truncate max-w-[200px]">
                                                        {locale === 'ar' ? product.name_en : product.name_ar}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold">{product.price} JOD</span>
                                            {product.compare_at_price && product.compare_at_price > product.price && (
                                                <span className="text-xs text-secondary line-through ml-2">
                                                    {product.compare_at_price}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${product.stock === 0 ? 'text-error' : product.stock <= 5 ? 'text-warning' : ''}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ProductStatusToggle
                                                productId={product.id}
                                                isActive={product.is_active}
                                                locale={locale}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/${locale}/seller/products/${product.id}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {locale === 'ar' ? 'تعديل' : 'Edit'}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl shadow-card">
                    <div className="text-5xl mb-4">📦</div>
                    <h2 className="text-xl font-semibold mb-2">
                        {locale === 'ar' ? 'لا توجد منتجات بعد' : 'No products yet'}
                    </h2>
                    <p className="text-secondary mb-6">
                        {locale === 'ar'
                            ? 'أضف منتجك الأول لبدء البيع'
                            : 'Add your first product to start selling'}
                    </p>
                    <Link
                        href={`/${locale}/seller/products/new`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                        {t('addProduct')}
                    </Link>
                </div>
            )}
        </div>
    );
}

function TabLink({
    href,
    active,
    label,
    count,
}: {
    href: string;
    active: boolean;
    label: string;
    count: number;
}) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
        >
            {label} ({count})
        </Link>
    );
}
