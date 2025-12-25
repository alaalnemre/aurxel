import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCatalogProducts, getCategories } from '@/lib/products/actions';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string; search?: string }>;
}) {
    const { locale } = await params;
    const { category, search } = await searchParams;
    setRequestLocale(locale);

    const [{ products }, categories] = await Promise.all([
        getCatalogProducts({ categorySlug: category, search }),
        getCategories(),
    ]);

    return (
        <ProductsContent
            products={products}
            categories={categories}
            locale={locale}
            activeCategory={category}
            searchQuery={search}
        />
    );
}

function ProductsContent({
    products,
    categories,
    locale,
    activeCategory,
    searchQuery,
}: {
    products: Awaited<ReturnType<typeof getCatalogProducts>>['products'];
    categories: Awaited<ReturnType<typeof getCategories>>;
    locale: string;
    activeCategory?: string;
    searchQuery?: string;
}) {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">{t('catalog.title')}</h1>
                    <p className="text-indigo-100">{t('catalog.subtitle')}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h2 className="font-semibold text-gray-900 mb-4">
                                {t('catalog.categories')}
                            </h2>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/products"
                                        className={`block px-3 py-2 rounded-lg transition-colors ${!activeCategory
                                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {t('catalog.allProducts')}
                                    </Link>
                                </li>
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/products?category=${category.slug}`}
                                            className={`block px-3 py-2 rounded-lg transition-colors ${activeCategory === category.slug
                                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {category.icon}{' '}
                                            {locale === 'ar' ? category.name_ar : category.name_en}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        <form className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={searchQuery}
                                    placeholder={t('catalog.searchPlaceholder')}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <svg
                                    className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </form>

                        {/* Products Grid */}
                        {products.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {t('catalog.noProducts')}
                                </h3>
                                <p className="text-gray-500">{t('catalog.noProductsDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                            {product.images?.[0]?.image_url ? (
                                                <img
                                                    src={product.images[0].image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg
                                                        className="w-16 h-16 text-gray-300"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            {product.compare_at_price &&
                                                product.compare_at_price > product.price && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                                        {t('catalog.sale')}
                                                    </span>
                                                )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {locale === 'ar' && product.name_ar
                                                    ? product.name_ar
                                                    : product.name}
                                            </h3>
                                            {product.category && (
                                                <p className="text-sm text-gray-500">
                                                    {locale === 'ar'
                                                        ? product.category.name_ar
                                                        : product.category.name_en}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-lg font-bold text-indigo-600">
                                                    {product.price.toFixed(2)} JOD
                                                </span>
                                                {product.compare_at_price &&
                                                    product.compare_at_price > product.price && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {product.compare_at_price.toFixed(2)}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
