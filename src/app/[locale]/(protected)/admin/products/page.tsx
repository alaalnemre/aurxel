import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getAdminProducts } from '@/lib/admin/actions';
import { AdminProductTable } from '@/components/admin/AdminProductTable';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const products = await getAdminProducts();

    return <AdminProductsContent products={products} locale={locale} />;
}

function AdminProductsContent({
    products,
    locale,
}: {
    products: Awaited<ReturnType<typeof getAdminProducts>>;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin.allProducts')}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {t('admin.moderateProducts')}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('admin.totalProducts')}</div>
                    <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('admin.activeProducts')}</div>
                    <div className="text-2xl font-bold text-green-600">
                        {products.filter((p) => p.is_active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('admin.inactiveProducts')}</div>
                    <div className="text-2xl font-bold text-gray-400">
                        {products.filter((p) => !p.is_active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">{t('admin.outOfStock')}</div>
                    <div className="text-2xl font-bold text-red-600">
                        {products.filter((p) => p.stock === 0).length}
                    </div>
                </div>
            </div>

            <AdminProductTable products={products} locale={locale} />
        </div>
    );
}
