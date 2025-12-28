import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const runtime = 'nodejs';

export default async function SellerProductsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) redirect(`/${locale}/become-seller`);

    const supabase = await createClient();
    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!seller) redirect(`/${locale}/become-seller`);

    const { data: products } = await supabase.from('products').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false });

    return (
        <div>
            <PageHeader
                title={t('seller.products')}
                action={<Link href={`/${locale}/seller/products/new`}><Button>{t('seller.addProduct')}</Button></Link>}
            />

            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <Card key={product.id} hover>
                            <Link href={`/${locale}/seller/products/${product.id}/edit`} className="block">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                                        <p className="text-primary-600 font-bold">{product.price_jod.toFixed(2)} {t('common.currency')}</p>
                                        <p className="text-sm text-gray-500">{t('product.stock')}: {product.stock}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={t('seller.noProducts')}
                    description={t('seller.addFirstProduct')}
                    action={<Link href={`/${locale}/seller/products/new`}><Button>{t('seller.addProduct')}</Button></Link>}
                />
            )}
        </div>
    );
}
