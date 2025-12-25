'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ProductWithDetails } from '@/lib/types/database';
import { toggleProductStatus, deleteProduct } from '@/lib/products/actions';
import { useState } from 'react';

interface ProductCardProps {
    product: ProductWithDetails;
    locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
    const t = useTranslations();
    const [isActive, setIsActive] = useState(product.is_active);
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        setLoading(true);
        const result = await toggleProductStatus(product.id, !isActive);
        if (result.success) {
            setIsActive(!isActive);
        }
        setLoading(false);
    }

    const primaryImage = product.images?.[0]?.image_url;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        {isActive ? t('products.active') : t('products.inactive')}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                {product.category && (
                    <p className="text-sm text-gray-500">
                        {locale === 'ar' ? product.category.name_ar : product.category.name_en}
                    </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-indigo-600">
                            {product.price.toFixed(2)} JOD
                        </span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                                {product.compare_at_price.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        {t('products.stock')}: {product.stock}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                    <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="flex-1 px-3 py-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        {t('common.edit')}
                    </Link>
                    <button
                        onClick={handleToggle}
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            } disabled:opacity-50`}
                    >
                        {isActive ? t('products.deactivate') : t('products.activate')}
                    </button>
                </div>
            </div>
        </div>
    );
}
