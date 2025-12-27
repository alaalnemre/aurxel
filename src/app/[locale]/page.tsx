import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Fetch featured products
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('id, name_en, name_ar, price, images, is_sponsored, seller_id')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('is_sponsored', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);

    return (
        <>
            <Header />
            <main className="min-h-screen">
                <HeroSection locale={locale} />
                <TrustStrip locale={locale} />
                <FeaturedSection locale={locale} products={products || []} />
                <WhySection locale={locale} />
                <FinalCTA locale={locale} />
                <Footer locale={locale} />
            </main>
        </>
    );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection({ locale }: { locale: string }) {
    const t = useTranslations('home.hero');
    const isRTL = locale === 'ar';

    return (
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28 xl:py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-bg-primary to-success/5" />

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-success/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-success-soft text-success text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fadeIn">
                        <span>🇯🇴</span>
                        <span>{isRTL ? 'سوق أردني 100%' : '100% Jordanian Marketplace'}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
                            {isRTL ? 'ادعم المحلي.' : 'Support Local.'}
                        </span>
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>
                        <span className="text-text-primary">
                            {isRTL ? 'تسوق من الأردن.' : 'Shop Jordan.'}
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-base sm:text-lg lg:text-xl text-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed">
                        {isRTL
                            ? 'اكتشف بائعين أردنيين موثوقين واحصل على توصيل محلي سريع.'
                            : 'Discover trusted Jordanian sellers and get fast local delivery.'}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                        <Link
                            href={`/${locale}/products`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl min-h-[48px]"
                        >
                            {isRTL ? 'ابدأ التسوق' : 'Start Shopping'}
                            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href={`/${locale}/register`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-bg-secondary border border-border hover:border-accent text-text-primary font-medium rounded-xl transition-all duration-300 min-h-[48px]"
                        >
                            {isRTL ? 'كن بائعاً' : 'Become a Seller'}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// TRUST STRIP
// ============================================
function TrustStrip({ locale }: { locale: string }) {
    const isRTL = locale === 'ar';

    const trustItems = [
        { icon: '🇯🇴', label: isRTL ? 'بائعين أردنيين' : 'Jordanian Sellers' },
        { icon: '💵', label: isRTL ? 'دفع عند الاستلام' : 'Cash on Delivery' },
        { icon: '🚚', label: isRTL ? 'توصيل سريع' : 'Fast Delivery' },
        { icon: '🔒', label: isRTL ? 'تسوق آمن' : 'Secure Shopping' },
    ];

    return (
        <section className="py-4 sm:py-6 bg-bg-muted border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-12">
                    {trustItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-text-secondary">
                            <span className="text-lg sm:text-xl">{item.icon}</span>
                            <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================
// FEATURED PRODUCTS
// ============================================
interface Product {
    id: string;
    name_en: string;
    name_ar: string;
    price: number;
    images: string[];
    is_sponsored: boolean;
}

function FeaturedSection({ locale, products }: { locale: string; products: Product[] }) {
    const isRTL = locale === 'ar';

    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                        {isRTL ? 'منتجات مميزة' : 'Featured Products'}
                    </h2>
                    <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
                        {isRTL
                            ? 'اكتشف أفضل المنتجات من البائعين المحليين'
                            : 'Discover the best products from local sellers'}
                    </p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.slice(0, 8).map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                locale={locale}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-8 sm:mt-12">
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center gap-2 px-6 py-3 text-accent hover:text-accent-hover font-medium transition-colors min-h-[44px]"
                    >
                        {isRTL ? 'عرض جميع المنتجات' : 'View All Products'}
                        <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product, locale, index }: { product: Product; locale: string; index: number }) {
    const isRTL = locale === 'ar';
    const name = isRTL ? product.name_ar : product.name_en;
    const hasImage = product.images && product.images.length > 0;

    return (
        <Link
            href={`/${locale}/products/${product.id}`}
            className="group card p-3 sm:p-4 hover:border-accent hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Image */}
            <div className="aspect-square bg-bg-muted rounded-xl mb-3 sm:mb-4 overflow-hidden relative">
                {hasImage ? (
                    <img
                        src={product.images[0]}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Sponsored badge */}
                {product.is_sponsored && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-warning/90 text-white text-[10px] sm:text-xs font-medium rounded-md">
                        {isRTL ? 'مميز' : 'Sponsored'}
                    </span>
                )}
            </div>

            {/* Info */}
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                {name}
            </h3>
            <p className="text-accent font-bold text-base sm:text-lg">
                {product.price.toFixed(2)} <span className="text-xs sm:text-sm text-text-muted font-normal">JOD</span>
            </p>
        </Link>
    );
}

function ProductSkeleton() {
    return (
        <div className="card p-3 sm:p-4 animate-pulse">
            <div className="aspect-square bg-bg-muted rounded-xl mb-3 sm:mb-4" />
            <div className="h-4 bg-bg-muted rounded w-3/4 mb-2" />
            <div className="h-5 bg-bg-muted rounded w-1/3" />
        </div>
    );
}

// ============================================
// WHY SECTION
// ============================================
function WhySection({ locale }: { locale: string }) {
    const isRTL = locale === 'ar';

    const reasons = [
        {
            icon: '🏪',
            title: isRTL ? 'ادعم المحلي' : 'Support Local',
            description: isRTL
                ? 'كل عملية شراء تدعم عائلة أردنية ومجتمعك المحلي'
                : 'Every purchase supports a Jordanian family and your local community',
        },
        {
            icon: '💰',
            title: isRTL ? 'أسعار عادلة' : 'Fair Prices',
            description: isRTL
                ? 'بدون وسطاء — اشتري مباشرة من البائعين المحليين'
                : 'No middlemen — buy directly from local sellers',
        },
        {
            icon: '🚀',
            title: isRTL ? 'توصيل موثوق' : 'Reliable Delivery',
            description: isRTL
                ? 'توصيل سريع من سائقين محليين موثوقين'
                : 'Fast delivery by trusted local drivers',
        },
    ];

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-bg-muted">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                        {isRTL ? 'لماذا جوردان ماركت؟' : 'Why JordanMarket?'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
                    {reasons.map((reason, i) => (
                        <div key={i} className="text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-accent-soft flex items-center justify-center">
                                <span className="text-2xl sm:text-3xl">{reason.icon}</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">{reason.title}</h3>
                            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================
// FINAL CTA
// ============================================
function FinalCTA({ locale }: { locale: string }) {
    const isRTL = locale === 'ar';

    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent to-accent/80 p-8 sm:p-12 lg:p-16 text-center text-white">
                    {/* Decorative */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }} />
                    </div>

                    <div className="relative">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                            {isRTL ? 'هل أنت مستعد للتسوق المحلي؟' : 'Ready to shop local?'}
                        </h2>
                        <p className="text-white/80 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                            {isRTL
                                ? 'انضم إلى آلاف الأردنيين الذين يدعمون مجتمعهم المحلي'
                                : 'Join thousands of Jordanians supporting their local community'}
                        </p>
                        <Link
                            href={`/${locale}/products`}
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-accent font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] min-h-[48px]"
                        >
                            {isRTL ? 'استكشف المنتجات' : 'Explore Products'}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// FOOTER
// ============================================
function Footer({ locale }: { locale: string }) {
    const isRTL = locale === 'ar';

    return (
        <footer className="py-8 sm:py-12 border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-lg mb-1">JordanMarket</p>
                        <p className="text-text-muted text-sm">
                            {isRTL ? '© 2024 جميع الحقوق محفوظة' : '© 2024 All rights reserved'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 text-sm text-text-secondary">
                        <Link href={`/${locale}/products`} className="hover:text-accent transition-colors">
                            {isRTL ? 'المنتجات' : 'Products'}
                        </Link>
                        <Link href={`/${locale}/login`} className="hover:text-accent transition-colors">
                            {isRTL ? 'تسجيل الدخول' : 'Login'}
                        </Link>
                        <Link href={`/${locale}/register`} className="hover:text-accent transition-colors">
                            {isRTL ? 'إنشاء حساب' : 'Register'}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
