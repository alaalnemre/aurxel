import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductDetails } from './ProductDetails';

export const runtime = 'nodejs';

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    const t = await getTranslations();
    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from('products')
        .select(`*, sellers(store_name, store_city)`)
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

    if (error || !product) {
        notFound();
    }

    return <ProductDetails product={product} locale={locale} />;
}
