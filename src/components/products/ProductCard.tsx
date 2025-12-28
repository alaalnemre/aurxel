import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/lib/database.types';

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
}

export function ProductCard({ product, locale, onAddToCart, isAddingToCart }: ProductCardProps) {
    const t = useTranslations();
    const isOutOfStock = product.stock <= 0;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price_jod;

    return (
        <Card hover padding="none" className="overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                            {t('store.outOfStock')}
                        </span>
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && !isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {Math.round((1 - product.price_jod / (product.compare_at_price || product.price_jod)) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <Link href={`/${locale}/product/${product.id}`}>
                    <h3 className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 mb-1">
                        {product.title}
                    </h3>
                </Link>

                {product.sellers && (
                    <p className="text-sm text-gray-500 mb-2">
                        {product.sellers.store_name}
                    </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                        {product.price_jod.toFixed(2)} {t('common.currency')}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            {product.compare_at_price?.toFixed(2)} {t('common.currency')}
                        </span>
                    )}
                </div>

                {/* Actions */}
                {onAddToCart && (
                    <Button
                        variant={isOutOfStock ? 'outline' : 'primary'}
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
