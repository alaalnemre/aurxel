import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getCategories, getProductForEdit } from '@/lib/products/actions';
import { ProductForm } from '@/components/seller/ProductForm';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const [product, categories] = await Promise.all([
        getProductForEdit(id),
        getCategories(),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <EditProductContent
            product={product}
            categories={categories}
            locale={locale}
        />
    );
}

function EditProductContent({
    product,
    categories,
    locale,
}: {
    product: Awaited<ReturnType<typeof getProductForEdit>>;
    categories: Awaited<ReturnType<typeof getCategories>>;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('products.editProduct')}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{product?.name}</p>
            </div>

            <ProductForm
                product={product}
                categories={categories}
                locale={locale}
                isEditing
            />
        </div>
    );
}
