'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { buyerUpdateCart, buyerRemoveCart } from '@/actions/cart';

interface CartItemsProps {
    items: Array<{
        id: string;
        quantity: number;
        products: {
            id: string;
            title: string;
            price_jod: number;
            stock: number;
            images: string[];
            sellers: { store_name: string } | null;
        } | null;
    }>;
    locale: string;
}

export function CartItems({ items, locale }: CartItemsProps) {
    const t = useTranslations();
    const router = useRouter();

    const handleUpdate = async (cartItemId: string, quantity: number) => {
        const formData = new FormData();
        formData.append('cartItemId', cartItemId);
        formData.append('quantity', quantity.toString());
        await buyerUpdateCart(formData);
        router.refresh();
    };

    const handleRemove = async (cartItemId: string) => {
        const formData = new FormData();
        formData.append('cartItemId', cartItemId);
        await buyerRemoveCart(formData);
        router.refresh();
    };

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const product = item.products;
                if (!product) return null;

                return (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{product.title}</h3>
                            {product.sellers && <p className="text-sm text-gray-500">{product.sellers.store_name}</p>}
                            <p className="font-bold text-primary-600 mt-1">{product.price_jod.toFixed(2)} {t('common.currency')}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center border rounded">
                                <button onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1">-</button>
                                <span className="px-2">{item.quantity}</span>
                                <button onClick={() => handleUpdate(item.id, Math.min(product.stock, item.quantity + 1))} className="px-2 py-1">+</button>
                            </div>
                            <button onClick={() => handleRemove(item.id)} className="text-sm text-red-600 hover:text-red-700">
                                {t('cart.remove')}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
