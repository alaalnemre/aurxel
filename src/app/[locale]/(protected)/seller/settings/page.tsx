'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { updateSellerProfile } from '@/lib/actions/seller';

export default function SellerSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await updateSellerProfile(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({
                type: 'success',
                text: locale === 'ar' ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
            });
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">
                {locale === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}
            </h1>

            {message && (
                <div className={`px-4 py-3 rounded-lg ${message.type === 'success'
                        ? 'bg-success/10 border border-success/20 text-success'
                        : 'bg-error/10 border border-error/20 text-error'
                    }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                {/* Business Info */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span>🏪</span>
                        {locale === 'ar' ? 'معلومات النشاط التجاري' : 'Business Information'}
                    </h2>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            {locale === 'ar' ? 'اسم المتجر' : 'Store Name'} *
                        </label>
                        <input
                            type="text"
                            name="business_name"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            {locale === 'ar' ? 'عنوان المتجر' : 'Store Address'} *
                        </label>
                        <input
                            type="text"
                            name="business_address"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                            </label>
                            <textarea
                                name="business_description_en"
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                            </label>
                            <textarea
                                name="business_description_ar"
                                rows={3}
                                dir="rtl"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading
                        ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                        : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
            </form>
        </div>
    );
}
