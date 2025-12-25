import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSellerProducts } from '@/lib/products/actions';
import { ProductCard } from '@/components/seller/ProductCard';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SellerProductsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const products = await getSellerProducts();

    return <SellerProductsContent products={products} locale={locale} />;
}

function SellerProductsContent({
    products,
    locale,
}: {
    products: Awaited<ReturnType<typeof getSellerProducts>>;
    locale: string;
}) {
    const t = useTranslations();

    const activeProducts = products.filter((p) => p.is_active);
    const inactiveProducts = products.filter((p) => !p.is_active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('products.myProducts')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('products.manageInventory')}
                    </p>
                </div>
                <Link
                    href="/seller/products/new"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    {t('products.addProduct')}
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('products.totalProducts')}</div>
                    <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('products.activeProducts')}</div>
                    <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('products.inactiveProducts')}</div>
                    <div className="text-2xl font-bold text-gray-400">{inactiveProducts.length}</div>
                </div>
            </div>

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
                        {t('products.noProducts')}
                    </h3>
                    <p className="text-gray-500 mb-6">{t('products.startSelling')}</p>
                    <Link
                        href="/seller/products/new"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {t('products.addFirstProduct')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} locale={locale} />
                    ))}
                </div>
            )}
        </div>
    );
}
