import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getProductDetails } from '@/lib/products/actions';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const product = await getProductDetails(id);

    if (!product) {
        notFound();
    }

    return <ProductDetailContent product={product} locale={locale} />;
}

function ProductDetailContent({
    product,
    locale,
}: {
    product: NonNullable<Awaited<ReturnType<typeof getProductDetails>>>;
    locale: string;
}) {
    const t = useTranslations();

    const productName =
        locale === 'ar' && product.name_ar ? product.name_ar : product.name;
    const productDescription =
        locale === 'ar' && product.description_ar
            ? product.description_ar
            : product.description;
    const categoryName = product.category
        ? locale === 'ar'
            ? product.category.name_ar
            : product.category.name_en
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-indigo-600">
                        {t('nav.home')}
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-indigo-600">
                        {t('catalog.title')}
                    </Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/products?category=${product.category.slug}`}
                                className="hover:text-indigo-600"
                            >
                                {categoryName}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-900">{productName}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
                        {/* Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                {product.images?.[0]?.image_url ? (
                                    <img
                                        src={product.images[0].image_url}
                                        alt={productName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg
                                            className="w-24 h-24 text-gray-300"
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
                            </div>
                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.slice(0, 4).map((image, index) => (
                                        <div
                                            key={image.id}
                                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                                        >
                                            <img
                                                src={image.image_url}
                                                alt={`${productName} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Category Badge */}
                            {product.category && (
                                <Link
                                    href={`/products?category=${product.category.slug}`}
                                    className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full hover:bg-indigo-100 transition-colors"
                                >
                                    {product.category.icon} {categoryName}
                                </Link>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900">{productName}</h1>

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-indigo-600">
                                    {product.price.toFixed(2)} JOD
                                </span>
                                {product.compare_at_price &&
                                    product.compare_at_price > product.price && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">
                                                {product.compare_at_price.toFixed(2)} JOD
                                            </span>
                                            <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                                                {Math.round(
                                                    ((product.compare_at_price - product.price) /
                                                        product.compare_at_price) *
                                                    100
                                                )}
                                                % {t('catalog.off')}
                                            </span>
                                        </>
                                    )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                />
                                <span
                                    className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {product.stock > 0
                                        ? `${t('catalog.inStock')} (${product.stock} ${t('catalog.available')})`
                                        : t('catalog.outOfStock')}
                                </span>
                            </div>

                            {/* Description */}
                            {productDescription && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t('catalog.description')}
                                    </h2>
                                    <p className="text-gray-600 whitespace-pre-line">
                                        {productDescription}
                                    </p>
                                </div>
                            )}

                            {/* Seller Info */}
                            {product.seller && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-semibold">
                                                {(product.seller.full_name || 'S')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">{t('catalog.soldBy')}</p>
                                            <p className="font-medium text-gray-900">
                                                {product.seller.full_name || t('catalog.seller')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart */}
                            <div className="border-t border-gray-200 pt-6">
                                <AddToCartButton product={product} locale={locale} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
