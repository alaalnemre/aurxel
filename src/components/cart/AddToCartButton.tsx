'use client';

import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/cart/CartContext';
import { useState } from 'react';
import type { ProductWithDetails } from '@/lib/types/database';

interface AddToCartButtonProps {
    product: ProductWithDetails;
    locale: string;
}

export function AddToCartButton({ product, locale }: AddToCartButtonProps) {
    const t = useTranslations();
    const { addItem, state } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [showError, setShowError] = useState(false);
    const [added, setAdded] = useState(false);

    const isOutOfStock = product.stock <= 0;
    const isDifferentSeller = state.sellerId && state.sellerId !== product.seller_id;

    function handleAddToCart() {
        if (isOutOfStock) return;

        const success = addItem({
            productId: product.id,
            productName: product.name,
            productNameAr: product.name_ar,
            sellerId: product.seller_id,
            sellerName: (product.seller as { full_name?: string } | null)?.full_name || null,
            price: product.price,
            quantity,
            imageUrl: product.images?.[0]?.image_url || null,
            stock: product.stock,
        });

        if (success) {
            setAdded(true);
            setShowError(false);
            setTimeout(() => setAdded(false), 2000);
        } else {
            setShowError(true);
        }
    }

    return (
        <div className="space-y-3">
            {showError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    {t('cart.differentSellerWarning')}
                </div>
            )}

            {isDifferentSeller && (
                <p className="text-sm text-amber-600">
                    ⚠️ {t('cart.clearCartWarning')}
                </p>
            )}

            <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        disabled={isOutOfStock}
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        disabled={isOutOfStock || quantity >= product.stock}
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : added
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    {isOutOfStock
                        ? t('cart.outOfStock')
                        : added
                            ? t('cart.added')
                            : t('cart.addToCart')}
                </button>
            </div>
        </div>
    );
}
