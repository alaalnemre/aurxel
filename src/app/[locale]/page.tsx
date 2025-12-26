import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <>
            <Header />
            <main>
                <HeroSection locale={locale} />
                <FeaturedSection locale={locale} />
            </main>
        </>
    );
}

function HeroSection({ locale }: { locale: string }) {
    const t = useTranslations('home.hero');

    return (
        <section className="relative overflow-hidden py-20 lg:py-32">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            {/* Content */}
            <div className="container mx-auto px-4 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fadeIn">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-secondary mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        {t('subtitle')}
                    </p>
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl animate-fadeIn"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {t('cta')}
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </section>
    );
}

function FeaturedSection({ locale }: { locale: string }) {
    const t = useTranslations('home');

    // Placeholder for featured products - will be dynamic later
    const placeholderProducts = [
        { id: 1, name: 'Product 1', price: 25 },
        { id: 2, name: 'Product 2', price: 35 },
        { id: 3, name: 'Product 3', price: 45 },
        { id: 4, name: 'Product 4', price: 55 },
    ];

    return (
        <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t('featured')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {placeholderProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="aspect-square bg-muted rounded-xl mb-4 flex items-center justify-center text-secondary">
                                <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">{product.name}</h3>
                            <p className="text-primary font-bold">{product.price} JOD</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                        View All Products
                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
