'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { createProduct, updateProduct } from '@/lib/products/actions';
import type { ProductWithDetails, Category } from '@/lib/types/database';

interface ProductFormProps {
    product?: ProductWithDetails | null;
    categories: Category[];
    locale: string;
    isEditing?: boolean;
}

export function ProductForm({
    product,
    categories,
    locale,
    isEditing,
}: ProductFormProps) {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        try {
            const result = isEditing && product
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (e) {
            setError('An unexpected error occurred');
        }

        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Basic Info */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('products.basicInfo')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('products.productName')} (English) *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                defaultValue={product?.name || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Product name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="nameAr"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('products.productName')} (Arabic)
                            </label>
                            <input
                                id="nameAr"
                                name="nameAr"
                                type="text"
                                dir="rtl"
                                defaultValue={product?.name_ar || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="اسم المنتج"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('products.description')} (English)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            defaultValue={product?.description || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="Product description"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="descriptionAr"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('products.description')} (Arabic)
                        </label>
                        <textarea
                            id="descriptionAr"
                            name="descriptionAr"
                            rows={4}
                            dir="rtl"
                            defaultValue={product?.description_ar || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="وصف المنتج"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label
                        htmlFor="categoryId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {t('products.category')}
                    </label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        defaultValue={product?.category_id || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">{t('products.selectCategory')}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.icon} {locale === 'ar' ? category.name_ar : category.name_en}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    {t('products.pricingInventory')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('products.price')} (JOD) *
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={product?.price || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="compareAtPrice"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('products.compareAtPrice')}
                        </label>
                        <input
                            id="compareAtPrice"
                            name="compareAtPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={product?.compare_at_price || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="stock"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('products.stock')} *
                        </label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            required
                            defaultValue={product?.stock || 0}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="sku"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {t('products.sku')}
                    </label>
                    <input
                        id="sku"
                        name="sku"
                        type="text"
                        defaultValue={product?.sku || ''}
                        className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="SKU-001"
                    />
                </div>

                {isEditing && (
                    <div className="flex items-center gap-3">
                        <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            defaultChecked={product?.is_active}
                            value="true"
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                            {t('products.productActive')}
                        </label>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <Link
                    href="/seller/products"
                    className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
                >
                    {t('common.cancel')}
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? t('common.loading')
                        : isEditing
                            ? t('products.updateProduct')
                            : t('products.createProduct')}
                </button>
            </div>
        </form>
    );
}
