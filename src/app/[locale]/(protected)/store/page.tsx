import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { StoreProducts } from './StoreProducts';

export const runtime = 'nodejs';

export default async function StorePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from('products')
        .select(`*, sellers(store_name)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[StorePage] Error:', error);
    }

    return (
        <div>
            <PageHeader title={t('store.title')} description={t('store.subtitle')} />

            {products && products.length > 0 ? (
                <StoreProducts products={products} locale={locale} />
            ) : (
                <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    title={t('store.noProducts')}
                />
            )}
        </div>
    );
}
