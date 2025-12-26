'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { updateSellerProfile } from '@/lib/actions/seller';

interface SellerProfile {
    id?: string;
    business_name?: string;
    business_address?: string;
    business_description_en?: string;
    business_description_ar?: string;
}

export function SellerOnboarding({
    locale,
    sellerProfile
}: {
    locale: string;
    sellerProfile: SellerProfile | null;
}) {
    const t = useTranslations('seller');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await updateSellerProfile(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // On success, the page will refresh and show dashboard
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏪</div>
                <h1 className="text-2xl font-bold mb-2">
                    {locale === 'ar' ? 'أكمل ملف متجرك' : 'Complete Your Store Profile'}
                </h1>
                <p className="text-secondary">
                    {locale === 'ar'
                        ? 'أضف معلومات نشاطك التجاري لبدء البيع'
                        : 'Add your business information to start selling'}
                </p>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">{t('businessName')} *</label>
                    <input
                        type="text"
                        name="business_name"
                        required
                        defaultValue={sellerProfile?.business_name === 'My Store' ? '' : sellerProfile?.business_name}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder={locale === 'ar' ? 'اسم متجرك' : 'Your store name'}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">{t('businessAddress')} *</label>
                    <input
                        type="text"
                        name="business_address"
                        required
                        defaultValue={sellerProfile?.business_address || ''}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder={locale === 'ar' ? 'عنوان النشاط التجاري' : 'Business address'}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {locale === 'ar' ? 'وصف المتجر (إنجليزي)' : 'Store Description (English)'}
                        </label>
                        <textarea
                            name="business_description_en"
                            rows={3}
                            defaultValue={sellerProfile?.business_description_en || ''}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            placeholder="Describe your store..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {locale === 'ar' ? 'وصف المتجر (عربي)' : 'Store Description (Arabic)'}
                        </label>
                        <textarea
                            name="business_description_ar"
                            rows={3}
                            dir="rtl"
                            defaultValue={sellerProfile?.business_description_ar || ''}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            placeholder="وصف متجرك..."
                        />
                    </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                        <span>📄</span>
                        {t('uploadDocuments')}
                    </h3>
                    <p className="text-sm text-secondary mb-3">
                        {locale === 'ar'
                            ? 'ارفع وثائق التحقق من الهوية (اختياري الآن)'
                            : 'Upload verification documents (optional for now)'}
                    </p>
                    <input
                        type="file"
                        name="documents"
                        multiple
                        accept="image/*,.pdf"
                        className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                    {loading
                        ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                        : (locale === 'ar' ? 'حفظ والمتابعة' : 'Save & Continue')}
                </button>
            </form>
        </div>
    );
}
