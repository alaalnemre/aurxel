'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buyerAddToCart } from '@/actions/cart';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
    sellers: { store_name: string; store_city: string | null } | null;
};

export function ProductDetails({ product, locale }: { product: Product; locale: string }) {
    const t = useTranslations();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState('');

    const isOutOfStock = product.stock <= 0;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price_jod;

    const handleAddToCart = async () => {
        setIsAdding(true);
        setMessage('');
        const formData = new FormData();
        formData.append('productId', product.id);
        formData.append('quantity', quantity.toString());

        const result = await buyerAddToCart(formData);
        if (result.success) {
            setMessage(t('product.addedToCart'));
            setTimeout(() => setMessage(''), 2000);
        } else {
            setMessage(result.error || 'Error');
        }
        setIsAdding(false);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Link href={`/${locale}/store`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
                ← {t('common.back')}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

                    {product.sellers && (
                        <p className="text-gray-500 mb-4">
                            {t('product.soldBy')}: {product.sellers.store_name}
                            {product.sellers.store_city && ` • ${product.sellers.store_city}`}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl font-bold text-gray-900">
                            {product.price_jod.toFixed(2)} {t('common.currency')}
                        </span>
                        {hasDiscount && (
                            <span className="text-xl text-gray-400 line-through">
                                {product.compare_at_price?.toFixed(2)} {t('common.currency')}
                            </span>
                        )}
                    </div>

                    <Card className="mb-6">
                        <p className="text-sm text-gray-600 mb-2">{t('product.stock')}</p>
                        <p className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutOfStock ? t('store.outOfStock') : `${product.stock} ${t('store.inStock')}`}
                        </p>
                    </Card>

                    {product.description && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{t('product.description')}</h3>
                            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {/* Add to Cart */}
                    {!isOutOfStock && (
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center border rounded-lg">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100">-</button>
                                <span className="px-4 py-2 font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-gray-100">+</button>
                            </div>
                            <Button onClick={handleAddToCart} isLoading={isAdding} className="flex-1">
                                {t('store.addToCart')}
                            </Button>
                        </div>
                    )}

                    {message && (
                        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
