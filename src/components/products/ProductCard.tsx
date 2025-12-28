'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/lib/database.types';
import type { ProfileBadgeWithDetails } from '@/actions/badges';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
    product: Product & {
        sellers?: {
            store_name: string;
        };
    };
    locale: string;
    onAddToCart?: (productId: string) => void;
    isAddingToCart?: boolean;
    sellerBadges?: ProfileBadgeWithDetails[];
}

export function ProductCard({ product, locale, onAddToCart, isAddingToCart, sellerBadges }: ProductCardProps) {
    const t = useTranslations();
    const isOutOfStock = product.stock <= 0;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price_jod;

    return (
        <Card hover padding="none" className="overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-dark/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-dark shadow-lg">
                            {t('store.outOfStock')}
                        </span>
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && !isOutOfStock && (
                    <div className="absolute top-3 start-3 bg-error text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                        {Math.round((1 - product.price_jod / (product.compare_at_price || product.price_jod)) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <Link href={`/${locale}/product/${product.id}`}>
                    <h3 className="font-semibold text-dark hover:text-primary line-clamp-2 mb-1 transition-colors">
                        {product.title}
                    </h3>
                </Link>

                {product.sellers && (
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {product.sellers.store_name}
                        </p>

                        {sellerBadges && sellerBadges.length > 0 && (
                            <div className="flex gap-1">
                                {sellerBadges.slice(0, 3).map(badge => (
                                    <div
                                        key={badge.id}
                                        className="group relative cursor-help"
                                        title={locale === 'ar' ? badge.titleAr : badge.titleEn}
                                    >
                                        <span className="text-sm">{badge.icon}</span>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-1.5 bg-dark text-white text-[9px] rounded shadow-xl z-50 text-center pointer-events-none">
                                            {locale === 'ar' ? badge.titleAr : badge.titleEn}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-primary">
                        {product.price_jod.toFixed(2)} {t('common.currency')}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            {product.compare_at_price?.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                {onAddToCart && (
                    <Button
                        variant={isOutOfStock ? 'secondary' : 'primary'}
                        size="sm"
                        className="w-full"
                        disabled={isOutOfStock || isAddingToCart}
                        onClick={() => onAddToCart(product.id)}
                        isLoading={isAddingToCart}
                    >
                        {isOutOfStock ? t('store.outOfStock') : t('store.addToCart')}
                    </Button>
                )}
            </div>
        </Card>
    );
}
