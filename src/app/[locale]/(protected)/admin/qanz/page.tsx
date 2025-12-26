'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { generateTopupCodes } from '@/lib/actions/admin';

export default function AdminQanzPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const t = useTranslations('admin');

    const [amount, setAmount] = useState('10');
    const [count, setCount] = useState('1');
    const [loading, setLoading] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true);
        setError(null);

        const result = await generateTopupCodes(
            parseFloat(amount),
            parseInt(count)
        );

        if (result.error) {
            setError(result.error);
        } else {
            setGeneratedCodes(result.codes || []);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('qanzControl')}</h1>

            {/* Generator */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>💎</span>
                    {locale === 'ar' ? 'توليد أكواد QANZ' : 'Generate QANZ Codes'}
                </h2>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            {locale === 'ar' ? 'قيمة الكود (JOD)' : 'Code Value (JOD)'}
                        </label>
                        <select
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary outline-none"
                        >
                            <option value="5">5 JOD</option>
                            <option value="10">10 JOD</option>
                            <option value="20">20 JOD</option>
                            <option value="50">50 JOD</option>
                            <option value="100">100 JOD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            {locale === 'ar' ? 'عدد الأكواد' : 'Number of Codes'}
                        </label>
                        <select
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary outline-none"
                        >
                            <option value="1">1</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading
                        ? (locale === 'ar' ? 'جاري التوليد...' : 'Generating...')
                        : (locale === 'ar' ? 'توليد الأكواد' : 'Generate Codes')}
                </button>
            </div>

            {/* Generated Codes */}
            {generatedCodes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>✅</span>
                        {locale === 'ar' ? 'الأكواد المُولدة' : 'Generated Codes'}
                    </h2>
                    <div className="space-y-2">
                        {generatedCodes.map((code, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
                            >
                                <code className="font-mono text-lg font-bold text-primary">
                                    {code}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="text-sm text-secondary hover:text-primary"
                                >
                                    {locale === 'ar' ? 'نسخ' : 'Copy'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-secondary mt-4 text-center">
                        {locale === 'ar'
                            ? `قيمة كل كود: ${amount} JOD`
                            : `Each code is worth ${amount} JOD`}
                    </p>
                </div>
            )}

            {/* Info */}
            <div className="bg-muted/30 rounded-xl p-4 text-sm text-secondary">
                <p>
                    {locale === 'ar'
                        ? 'الأكواد المُولدة تصلح للاستخدام مرة واحدة فقط. بعد استخدام الكود، يتم إضافة القيمة لمحفظة QANZ الخاصة بالمستخدم.'
                        : 'Generated codes are single-use only. Once redeemed, the value is added to the user\'s QANZ wallet.'}
                </p>
            </div>
        </div>
    );
}
