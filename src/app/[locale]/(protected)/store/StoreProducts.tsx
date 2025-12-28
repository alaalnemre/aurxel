'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import { buyerAddToCart } from '@/actions/cart';
import type { Database } from '@/lib/database.types';
import type { ProfileBadgeWithDetails } from '@/actions/badges';

type Product = Database['public']['Tables']['products']['Row'] & {
    sellers: { store_name: string; profile_id: string } | null;
};

interface StoreProductsProps {
    products: Product[];
    locale: string;
    sellerBadgesMap?: Record<string, ProfileBadgeWithDetails[]>;
}

export function StoreProducts({ products, locale, sellerBadgesMap }: StoreProductsProps) {
    const router = useRouter();
    const [addingId, setAddingId] = useState<string | null>(null);

    const handleAddToCart = async (productId: string) => {
        setAddingId(productId);
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('quantity', '1');

        const result = await buyerAddToCart(formData);
        if (result.success) {
            router.refresh();
        }
        setAddingId(null);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={{ ...product, sellers: product.sellers || undefined }}
                    locale={locale}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={addingId === product.id}
                    sellerBadges={product.sellers?.profile_id ? sellerBadgesMap?.[product.sellers.profile_id] : undefined}
                />
            ))}
        </div>
    );
}
