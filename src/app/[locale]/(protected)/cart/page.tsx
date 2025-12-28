import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { CartItems } from './CartItems';

export const runtime = 'nodejs';

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const supabase = await createClient();
    const user = await getUser();

    if (!user) return null;

    const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`*, products(id, title, price_jod, stock, images, sellers(store_name))`)
        .eq('profile_id', user.id);

    const items = cartItems || [];
    const subtotal = items.reduce((sum, item) => {
        const product = item.products as { price_jod: number } | null;
        return sum + (product?.price_jod || 0) * item.quantity;
    }, 0);
    const deliveryFee = items.length > 0 ? 2.0 : 0;
    const total = subtotal + deliveryFee;

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title={t('cart.title')} />

            {items.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <CartItems items={items} locale={locale} />
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border h-fit">
                        <h3 className="font-semibold text-lg mb-4">{t('cart.title')}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{subtotal.toFixed(2)} {t('common.currency')}</span></div>
                            <div className="flex justify-between"><span>{t('cart.deliveryFee')}</span><span>{deliveryFee.toFixed(2)} {t('common.currency')}</span></div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>{t('cart.total')}</span><span>{total.toFixed(2)} {t('common.currency')}</span>
                            </div>
                        </div>
                        <Link href={`/${locale}/checkout`}>
                            <Button className="w-full mt-4">{t('cart.checkout')}</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    title={t('cart.empty')}
                    description={t('cart.emptyMessage')}
                    action={<Link href={`/${locale}/store`}><Button>{t('cart.continueShopping')}</Button></Link>}
                />
            )}
        </div>
    );
}
