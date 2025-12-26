'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/lib/hooks/useCart';

export default function CartPage() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('cart');
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

    const total = getTotal();
    const deliveryFee = total > 0 ? 2.5 : 0; // Fixed delivery fee
    const grandTotal = total + deliveryFee;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

                    {items.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-card rounded-xl p-4 shadow-card flex gap-4 animate-fadeIn"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={locale === 'ar' ? item.name_ar : item.name_en}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl text-secondary/50">
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/${locale}/products/${item.id}`}
                                                className="font-medium hover:text-primary transition-colors line-clamp-2"
                                            >
                                                {locale === 'ar' ? item.name_ar : item.name_en}
                                            </Link>
                                            <p className="text-primary font-bold mt-1">
                                                {item.price.toFixed(2)} JOD
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-auto text-sm text-error hover:underline"
                                                >
                                                    {t('remove')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {(item.price * item.quantity).toFixed(2)} JOD
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-secondary hover:text-error transition-colors"
                                >
                                    {locale === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                                    <h2 className="text-lg font-semibold mb-4">
                                        {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-secondary">{t('subtotal')}</span>
                                            <span className="font-medium">{total.toFixed(2)} JOD</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-secondary">{t('delivery')}</span>
                                            <span className="font-medium">{deliveryFee.toFixed(2)} JOD</span>
                                        </div>
                                        <div className="border-t border-border pt-3 flex justify-between">
                                            <span className="font-semibold">{t('total')}</span>
                                            <span className="font-bold text-lg text-primary">
                                                {grandTotal.toFixed(2)} JOD
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/${locale}/checkout`}
                                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {t('checkout')}
                                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>

                                    <Link
                                        href={`/${locale}/products`}
                                        className="block text-center text-sm text-primary hover:underline mt-4"
                                    >
                                        {t('continueShopping')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🛒</div>
                            <h2 className="text-xl font-semibold mb-2">{t('empty')}</h2>
                            <p className="text-secondary mb-6">
                                {locale === 'ar'
                                    ? 'ابدأ التسوق وأضف منتجات لسلتك'
                                    : 'Start shopping and add products to your cart'}
                            </p>
                            <Link
                                href={`/${locale}/products`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                            >
                                {t('continueShopping')}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
