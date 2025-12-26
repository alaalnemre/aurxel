'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/lib/hooks/useCart';
import { createOrder } from '@/lib/actions/orders';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const t = useTranslations('checkout');
    const { items, getTotal, getSellerIds, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const total = getTotal();
    const deliveryFee = 2.5;
    const grandTotal = total + deliveryFee;

    // Group items by seller
    const itemsBySeller = items.reduce((acc, item) => {
        if (!acc[item.seller_id]) {
            acc[item.seller_id] = [];
        }
        acc[item.seller_id].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    const sellerCount = Object.keys(itemsBySeller).length;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const address = formData.get('address') as string;
        const phone = formData.get('phone') as string;
        const notes = formData.get('notes') as string;

        if (!address || !phone) {
            setError(locale === 'ar' ? 'العنوان ورقم الهاتف مطلوبان' : 'Address and phone are required');
            setLoading(false);
            return;
        }

        try {
            // Create orders for each seller
            for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
                const orderTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

                const result = await createOrder({
                    sellerId,
                    items: sellerItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        unitPrice: item.price,
                    })),
                    totalAmount: orderTotal + (deliveryFee / sellerCount),
                    deliveryFee: deliveryFee / sellerCount,
                    deliveryAddress: address,
                    deliveryPhone: phone,
                    notes: notes || null,
                });

                if (result.error) {
                    throw new Error(result.error);
                }
            }

            clearCart();
            router.push(`/${locale}/buyer/orders?success=true`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order');
            setLoading(false);
        }
    }

    if (items.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-muted/30 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h1 className="text-xl font-semibold mb-2">
                            {locale === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
                        </h1>
                        <Link
                            href={`/${locale}/products`}
                            className="text-primary hover:underline"
                        >
                            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form action={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Delivery Address */}
                                <div className="bg-card rounded-2xl p-6 shadow-card">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span>📍</span>
                                        {t('deliveryAddress')}
                                    </h2>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                        placeholder={t('addressPlaceholder')}
                                    />
                                </div>

                                {/* Phone */}
                                <div className="bg-card rounded-2xl p-6 shadow-card">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span>📱</span>
                                        {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                    </h2>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder="+962 7X XXX XXXX"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="bg-card rounded-2xl p-6 shadow-card">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span>📝</span>
                                        {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                                    </h2>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                        placeholder={locale === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional notes (optional)'}
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="bg-card rounded-2xl p-6 shadow-card">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span>💵</span>
                                        {t('paymentMethod')}
                                    </h2>
                                    <div className="flex items-center gap-3 p-4 bg-success/10 border-2 border-success rounded-xl">
                                        <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center text-2xl">
                                            💵
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-success">{t('cashOnDelivery')}</p>
                                            <p className="text-sm text-secondary">{t('codNote')}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button (Mobile) */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="lg:hidden w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading
                                        ? (locale === 'ar' ? 'جاري الطلب...' : 'Placing Order...')
                                        : t('placeOrder')}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                                <h2 className="text-lg font-semibold mb-4">
                                    {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                                </h2>

                                {/* Items Preview */}
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={locale === 'ar' ? item.name_ar : item.name_en}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {locale === 'ar' ? item.name_ar : item.name_en}
                                                </p>
                                                <p className="text-xs text-secondary">
                                                    {item.quantity} × {item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium">
                                                {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border pt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary">
                                            {locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                                        </span>
                                        <span>{total.toFixed(2)} JOD</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary">
                                            {locale === 'ar' ? 'التوصيل' : 'Delivery'}
                                        </span>
                                        <span>{deliveryFee.toFixed(2)} JOD</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-border">
                                        <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                                        <span className="text-primary text-lg">
                                            {grandTotal.toFixed(2)} JOD
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button (Desktop) */}
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    onClick={() => {
                                        const form = document.querySelector('form');
                                        if (form) form.requestSubmit();
                                    }}
                                    disabled={loading}
                                    className="hidden lg:flex w-full mt-6 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        locale === 'ar' ? 'جاري الطلب...' : 'Placing Order...'
                                    ) : (
                                        <>
                                            {t('placeOrder')}
                                            <span className="font-normal">({grandTotal.toFixed(2)} JOD)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
