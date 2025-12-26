import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('product');

    const supabase = await createClient();

    // Fetch product
    const { data: product } = await supabase
        .from('products')
        .select(`
      *,
      seller:profiles!products_seller_id_fkey(id, full_name),
      seller_profile:seller_profiles!products_seller_id_fkey(business_name, is_verified)
    `)
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

    if (!product) {
        notFound();
    }

    const name = locale === 'ar' ? product.name_ar : product.name_en;
    const description = locale === 'ar' ? product.description_ar : product.description_en;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.compare_at_price!) * 100)
        : 0;

    // Get seller info safely
    const sellerName = Array.isArray(product.seller_profile)
        ? product.seller_profile[0]?.business_name
        : product.seller_profile?.business_name || 'Store';
    const isVerified = Array.isArray(product.seller_profile)
        ? product.seller_profile[0]?.is_verified
        : product.seller_profile?.is_verified;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-secondary mb-6">
                        <Link href={`/${locale}`} className="hover:text-primary">
                            {locale === 'ar' ? 'الرئيسية' : 'Home'}
                        </Link>
                        <span>/</span>
                        <Link href={`/${locale}/products`} className="hover:text-primary">
                            {locale === 'ar' ? 'المنتجات' : 'Products'}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground truncate max-w-[200px]">{name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square bg-card rounded-2xl overflow-hidden shadow-card">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl text-secondary/50">
                                        📦
                                    </div>
                                )}
                                {hasDiscount && (
                                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-error text-white font-bold rounded-lg">
                                        -{discountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {product.images.map((img: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-colors"
                                        >
                                            <Image
                                                src={img}
                                                alt={`${name} ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Title & Store */}
                            <div>
                                <Link
                                    href={`/${locale}/stores/${product.seller_id}`}
                                    className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-2"
                                >
                                    <span>🏪</span>
                                    <span>{sellerName}</span>
                                    {isVerified && <span className="text-success">✓</span>}
                                </Link>
                                <h1 className="text-2xl lg:text-3xl font-bold">{name}</h1>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-primary">
                                    {product.price.toFixed(2)} JOD
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl text-secondary line-through">
                                        {product.compare_at_price!.toFixed(2)} JOD
                                    </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {product.stock > 0 ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-success" />
                                        <span className="text-success font-medium">{t('inStock')}</span>
                                        {product.stock <= 10 && (
                                            <span className="text-secondary text-sm">
                                                ({product.stock} {locale === 'ar' ? 'متبقي' : 'left'})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-error" />
                                        <span className="text-error font-medium">{t('outOfStock')}</span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            {description && (
                                <div>
                                    <h2 className="font-semibold mb-2">{t('description')}</h2>
                                    <p className="text-secondary leading-relaxed">{description}</p>
                                </div>
                            )}

                            {/* Add to Cart */}
                            <div className="pt-4">
                                <AddToCartButton
                                    product={{
                                        id: product.id,
                                        name_en: product.name_en,
                                        name_ar: product.name_ar,
                                        price: product.price,
                                        image: product.images?.[0] || null,
                                        seller_id: product.seller_id,
                                        stock: product.stock,
                                    }}
                                    locale={locale}
                                />
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-card rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🚚</span>
                                    <div>
                                        <p className="font-medium">
                                            {locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
                                        </p>
                                        <p className="text-sm text-secondary">
                                            {locale === 'ar' ? 'توصيل داخل الأردن' : 'Delivery within Jordan'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💵</span>
                                    <div>
                                        <p className="font-medium">
                                            {locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                                        </p>
                                        <p className="text-sm text-secondary">
                                            {locale === 'ar' ? 'ادفع عند استلام طلبك' : 'Pay when you receive your order'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
