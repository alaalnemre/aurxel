import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getCategories } from '@/lib/products/actions';
import { ProductForm } from '@/components/seller/ProductForm';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function NewProductPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const categories = await getCategories();

    return <NewProductContent categories={categories} locale={locale} />;
}

function NewProductContent({
    categories,
    locale,
}: {
    categories: Awaited<ReturnType<typeof getCategories>>;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('products.addProduct')}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {t('products.addProductDescription')}
                </p>
            </div>

            <ProductForm categories={categories} locale={locale} />
        </div>
    );
}
