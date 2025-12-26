'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createProduct } from '@/lib/actions/seller';

export default function NewProductPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const t = useTranslations('seller');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await createProduct(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/${locale}/seller/products`);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('addProduct')}</h1>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                {/* Names */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span>📝</span>
                        {locale === 'ar' ? 'معلومات المنتج' : 'Product Info'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'} *
                            </label>
                            <input
                                type="text"
                                name="name_en"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="Product name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'} *
                            </label>
                            <input
                                type="text"
                                name="name_ar"
                                required
                                dir="rtl"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="اسم المنتج"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                            </label>
                            <textarea
                                name="description_en"
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                placeholder="Product description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                            </label>
                            <textarea
                                name="description_ar"
                                rows={3}
                                dir="rtl"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                placeholder="وصف المنتج..."
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span>💰</span>
                        {locale === 'ar' ? 'التسعير' : 'Pricing'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'السعر (JOD)' : 'Price (JOD)'} *
                            </label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0.01"
                                step="0.01"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'سعر المقارنة' : 'Compare at Price'}
                            </label>
                            <input
                                type="number"
                                name="compare_at_price"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'المخزون' : 'Stock'} *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span>🖼️</span>
                        {locale === 'ar' ? 'الصور' : 'Images'}
                    </h2>
                    <p className="text-sm text-secondary">
                        {locale === 'ar'
                            ? 'ارفع صور المنتج (قريباً)'
                            : 'Upload product images (coming soon)'}
                    </p>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-2">📷</span>
                        <p className="text-secondary text-sm">
                            {locale === 'ar' ? 'رفع الصور قريباً' : 'Image upload coming soon'}
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 bg-muted text-secondary font-medium rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading
                            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                            : t('addProduct')}
                    </button>
                </div>
            </form>
        </div>
    );
}
