import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
    const t = await getTranslations('homepage');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-6 animate-fade-in">
                        {t('hero')}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-slide-up">
                        {t('heroSubtitle')}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="/en/shop"
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {t('startShopping')}
                        </a>
                        <a
                            href="/en/vendor/onboarding"
                            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {t('becomeVendor')}
                        </a>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-center mb-12">{t('categories')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { key: 'categoryShop', icon: '🛍️', color: 'from-blue-400 to-blue-600' },
                            { key: 'categoryFood', icon: '🍔', color: 'from-orange-400 to-red-600' },
                            { key: 'categoryPharmacy', icon: '💊', color: 'from-green-400 to-emerald-600' },
                            { key: 'categoryGrocery', icon: '🥬', color: 'from-lime-400 to-green-600' },
                            { key: 'categoryParcel', icon: '📦', color: 'from-amber-400 to-orange-600' },
                            { key: 'categoryRental', icon: '🚗', color: 'from-purple-400 to-indigo-600' },
                        ].map((category) => (
                            <div
                                key={category.key}
                                className="bg-card rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-border"
                            >
                                <div className={`text-5xl mb-3 bg-gradient-to-br ${category.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                                    {category.icon}
                                </div>
                                <h3 className="font-semibold text-lg">{t(category.key)}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
