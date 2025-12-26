'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name_en: string;
    name_ar: string;
    price: number;
    compare_at_price: number | null;
    images: string[];
    stock: number;
}

export function ProductCard({ product, locale }: { product: Product; locale: string }) {
    const name = locale === 'ar' ? product.name_ar : product.name_en;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.compare_at_price!) * 100)
        : 0;

    return (
        <Link
            href={`/${locale}/products/${product.id}`}
            className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative aspect-square bg-muted">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-secondary/50">
                        📦
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-error text-white text-xs font-bold rounded-lg">
                        -{discountPercent}%
                    </span>
                )}

                {/* Low Stock Badge */}
                {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-warning/90 text-white text-xs rounded-lg">
                        {locale === 'ar' ? `${product.stock} فقط` : `Only ${product.stock}`}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {name}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                        {product.price.toFixed(2)} JOD
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-secondary line-through">
                            {product.compare_at_price!.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
