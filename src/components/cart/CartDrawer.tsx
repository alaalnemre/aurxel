'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/lib/cart/CartContext';
import { useState } from 'react';

export function CartDrawer({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const t = useTranslations();
    const { state, updateQuantity, removeItem, getTotal, getItemCount } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {t('cart.title')} ({getItemCount()})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {state.items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">{t('cart.empty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Seller Info */}
                            {state.sellerName && (
                                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                                    {t('cart.sellerFrom')}: <span className="font-medium">{state.sellerName}</span>
                                </div>
                            )}

                            {/* Items */}
                            {state.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-4 bg-white border border-gray-200 rounded-lg p-3"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                📦
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {item.productName}
                                        </h3>
                                        <p className="text-indigo-600 font-semibold">
                                            {item.price.toFixed(2)} JOD
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="ml-auto text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {state.items.length > 0 && (
                    <div className="border-t border-gray-200 p-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>{t('cart.total')}</span>
                            <span className="text-indigo-600">{getTotal().toFixed(2)} JOD</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="block w-full py-3 bg-indigo-600 text-white text-center font-semibold rounded-lg hover:bg-indigo-700"
                        >
                            {t('cart.checkout')}
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

export function CartButton() {
    const t = useTranslations();
    const { getItemCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const itemCount = getItemCount();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </button>

            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
