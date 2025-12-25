'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart/CartContext';
import { createOrder } from '@/lib/orders/actions';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const t = useTranslations();
    const router = useRouter();
    const { state, getTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '',
        phone: '',
        notes: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!deliveryInfo.address.trim()) {
            setError('Delivery address is required');
            return;
        }

        if (!deliveryInfo.phone.trim()) {
            setError('Phone number is required');
            return;
        }

        setLoading(true);

        const result = await createOrder(state.items, deliveryInfo);

        if (result.success && result.orderId) {
            clearCart();
            router.push(`/buyer/orders/${result.orderId}`);
        } else {
            setError(result.error || 'Failed to create order');
            setLoading(false);
        }
    }

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('cart.empty')}
                    </h2>
                    <p className="text-gray-500 mb-6">{t('cart.emptyMessage')}</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                    >
                        {t('cart.continueShopping')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    {t('checkout.title')}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Delivery Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t('checkout.deliveryInfo')}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('checkout.address')} *
                                        </label>
                                        <textarea
                                            value={deliveryInfo.address}
                                            onChange={(e) =>
                                                setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                                            }
                                            rows={3}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder={t('checkout.addressPlaceholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('checkout.phone')} *
                                        </label>
                                        <input
                                            type="tel"
                                            value={deliveryInfo.phone}
                                            onChange={(e) =>
                                                setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })
                                            }
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="+962 7X XXX XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('checkout.notes')}
                                        </label>
                                        <textarea
                                            value={deliveryInfo.notes}
                                            onChange={(e) =>
                                                setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })
                                            }
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder={t('checkout.notesPlaceholder')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t('checkout.paymentMethod')}
                                </h2>

                                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-green-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-800">
                                            {t('checkout.cod')}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            {t('checkout.codDescription')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button (Mobile) */}
                            <div className="lg:hidden">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? t('common.loading') : t('checkout.placeOrder')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('checkout.orderSummary')}
                            </h2>

                            {/* Seller */}
                            <div className="text-sm text-gray-500 mb-4">
                                {t('checkout.sellerFrom')}: {state.sellerName || 'Seller'}
                            </div>

                            {/* Items */}
                            <div className="space-y-3 mb-4">
                                {state.items.map((item) => (
                                    <div key={item.productId} className="flex justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.productName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} × {item.price.toFixed(2)} JOD
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {(item.price * item.quantity).toFixed(2)} JOD
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>{t('checkout.total')}</span>
                                    <span className="text-indigo-600">{getTotal().toFixed(2)} JOD</span>
                                </div>
                            </div>

                            {/* Submit Button (Desktop) */}
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                onClick={handleSubmit}
                                className="hidden lg:block w-full mt-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? t('common.loading') : t('checkout.placeOrder')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
