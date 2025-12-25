'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { generateCodes } from '@/lib/qanz/actions';

export function GenerateCodesForm() {
    const t = useTranslations();
    const [amount, setAmount] = useState('10');
    const [quantity, setQuantity] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setGeneratedCodes([]);

        const amountNum = parseFloat(amount);
        const quantityNum = parseInt(quantity, 10);

        if (isNaN(amountNum) || amountNum <= 0) {
            setError(t('qanz.errors.invalidAmount'));
            return;
        }

        if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > 100) {
            setError(t('qanz.errors.invalidQuantity'));
            return;
        }

        setLoading(true);

        const result = await generateCodes(amountNum, quantityNum);

        if (!result.success) {
            setError(result.error || t('qanz.errors.generateFailed'));
        } else {
            setGeneratedCodes(result.codes || []);
        }

        setLoading(false);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(generatedCodes.join('\n'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {t('qanz.codeAmount')}
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {t('qanz.codesQuantity')}
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? t('common.loading') : t('qanz.generate')}
            </button>

            {generatedCodes.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-green-800">
                            {t('qanz.generatedCodes')} ({generatedCodes.length})
                        </h3>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="text-sm text-green-600 hover:text-green-800"
                        >
                            {t('qanz.copyAll')}
                        </button>
                    </div>
                    <div className="space-y-1 font-mono text-sm">
                        {generatedCodes.map((code, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <code className="bg-white px-2 py-1 rounded border border-green-300">
                                    {code}
                                </code>
                                <span className="text-green-600">{amount} QANZ</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
}
