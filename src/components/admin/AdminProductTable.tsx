'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ProductWithDetails } from '@/lib/types/database';
import { adminToggleProductStatus } from '@/lib/admin/actions';

interface AdminProductTableProps {
    products: ProductWithDetails[];
    locale: string;
}

export function AdminProductTable({ products, locale }: AdminProductTableProps) {
    const t = useTranslations();
    const [productStates, setProductStates] = useState<Record<string, boolean>>(
        products.reduce((acc, p) => ({ ...acc, [p.id]: p.is_active }), {})
    );
    const [loading, setLoading] = useState<string | null>(null);

    async function handleToggle(productId: string) {
        setLoading(productId);
        const currentState = productStates[productId];
        const result = await adminToggleProductStatus(productId, !currentState);

        if (result.success) {
            setProductStates((prev) => ({
                ...prev,
                [productId]: !currentState,
            }));
        }
        setLoading(null);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.product')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.seller')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.category')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.price')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.stock')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.status')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                {t('admin.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => {
                            const isActive = productStates[product.id];
                            const isLoading = loading === product.id;

                            return (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {product.images?.[0]?.image_url ? (
                                                    <img
                                                        src={product.images[0].image_url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    ID: {product.id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">
                                            {(product.seller as { full_name?: string } | null)?.full_name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">
                                            {product.category
                                                ? locale === 'ar'
                                                    ? product.category.name_ar
                                                    : product.category.name_en
                                                : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {product.price.toFixed(2)} JOD
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {isActive ? t('admin.active') : t('admin.inactive')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => handleToggle(product.id)}
                                            disabled={isLoading}
                                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${isActive
                                                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                } disabled:opacity-50`}
                                        >
                                            {isActive ? t('admin.disable') : t('admin.enable')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    {t('admin.noProductsFound')}
                </div>
            )}
        </div>
    );
}
