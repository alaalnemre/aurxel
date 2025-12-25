import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getAdminCategories } from '@/lib/admin/actions';
import { CategoryManager } from '@/components/admin/CategoryManager';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const categories = await getAdminCategories();

    return <AdminCategoriesContent categories={categories} locale={locale} />;
}

function AdminCategoriesContent({
    categories,
    locale,
}: {
    categories: Awaited<ReturnType<typeof getAdminCategories>>;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin.categories')}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {t('admin.manageCategories')}
                </p>
            </div>

            <CategoryManager categories={categories} locale={locale} />
        </div>
    );
}
