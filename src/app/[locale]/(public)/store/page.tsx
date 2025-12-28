import { getProducts } from "@/actions/products";
import { Link } from "@/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Card, EmptyState } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function StorePage() {
    const t = await getTranslations("store");
    const locale = await getLocale();
    const result = await getProducts({ limit: 20 });

    const products = result.success ? result.data?.products || [] : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            </div>

            {products.length === 0 ? (
                <EmptyState
                    title={t("allProducts")}
                    description="No products available yet. Check back soon!"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link key={product.id} href={`/store/${product.id}`}>
                            <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                                <div className="aspect-square bg-gray-100 relative">
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={locale === "ar" ? product.name_ar : product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {product.stock_quantity === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {t("outOfStock")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                        {locale === "ar" ? product.name_ar : product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {product.seller?.business_name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-[#0F766E]">
                                            {Number(product.base_price).toFixed(2)} JOD
                                        </span>
                                        {product.rating_count > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {Number(product.rating_average).toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
