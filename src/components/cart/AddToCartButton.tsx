'use client';

import { useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';

interface Product {
    id: string;
    name_en: string;
    name_ar: string;
    price: number;
    image: string | null;
    seller_id: string;
    stock: number;
}

export function AddToCartButton({ product, locale }: { product: Product; locale: string }) {
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name_en: product.name_en,
            name_ar: product.name_ar,
            price: product.price,
            image: product.image,
            seller_id: product.seller_id,
            quantity,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const inStock = product.stock > 0;
    const maxQty = Math.min(product.stock, 10);

    return (
        <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-secondary">
                    {locale === 'ar' ? 'الكمية' : 'Quantity'}:
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        disabled={quantity >= maxQty}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${added
                        ? 'bg-success text-white'
                        : inStock
                            ? 'bg-primary hover:bg-primary-dark text-white'
                            : 'bg-muted text-secondary cursor-not-allowed'
                    }`}
            >
                {added ? (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {locale === 'ar' ? 'تمت الإضافة!' : 'Added!'}
                    </>
                ) : inStock ? (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                    </>
                ) : (
                    locale === 'ar' ? 'غير متوفر' : 'Out of Stock'
                )}
            </button>

            {/* Total Preview */}
            {inStock && quantity > 1 && (
                <p className="text-sm text-secondary text-center">
                    {locale === 'ar' ? 'المجموع: ' : 'Total: '}
                    <span className="font-semibold text-foreground">
                        {(product.price * quantity).toFixed(2)} JOD
                    </span>
                </p>
            )}
        </div>
    );
}
