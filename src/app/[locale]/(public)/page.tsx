// src/app/[locale]/(public)/page.tsx
// Public home page

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <HomeContent />;
}

function HomeContent() {
    const t = useTranslations('home');
    const tCommon = useTranslations('common');

    return (
        <div className="flex flex-col items-center justify-center px-4 py-24">
            {/* Hero Section */}
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
                    {t('title')}
                </h1>
                <p className="mb-10 text-xl text-gray-600 dark:text-gray-300">
                    {t('subtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        href="/register"
                        className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
                    >
                        {t('exploreButton')}
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-xl border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                    >
                        {t('sellButton')}
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="mt-24 grid max-w-5xl gap-8 px-4 md:grid-cols-3">
                <FeatureCard
                    icon="🛒"
                    title="Shop Local"
                    description="Discover products from local Jordanian sellers"
                />
                <FeatureCard
                    icon="🚚"
                    title="Fast Delivery"
                    description="Get your orders delivered quickly across Jordan"
                />
                <FeatureCard
                    icon="💰"
                    title="Cash on Delivery"
                    description="Pay when you receive - no online payment needed"
                />
            </div>

            {/* Health Check Badge */}
            <div className="mt-16 rounded-lg bg-green-100 px-6 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                ✅ Server rendering works! | {tCommon('appName')}
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 text-4xl">{icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}
