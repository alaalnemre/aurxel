'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toggleRewardRule, updateRewardAmount } from '@/lib/qanz/rewards';
import type { QanzRewardRule } from '@/lib/types/database';

interface RewardRulesListProps {
    rules: QanzRewardRule[];
    locale: string;
}

export function RewardRulesList({ rules, locale }: RewardRulesListProps) {
    const t = useTranslations();

    return (
        <div className="divide-y divide-gray-200">
            {rules.map((rule) => (
                <RewardRuleRow key={rule.id} rule={rule} locale={locale} />
            ))}
        </div>
    );
}

function RewardRuleRow({ rule, locale }: { rule: QanzRewardRule; locale: string }) {
    const t = useTranslations();
    const [isActive, setIsActive] = useState(rule.is_active);
    const [amount, setAmount] = useState(rule.amount);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        setLoading(true);
        const result = await toggleRewardRule(rule.id, !isActive);
        if (result.success) {
            setIsActive(!isActive);
        }
        setLoading(false);
    }

    async function handleSaveAmount() {
        if (amount <= 0) return;
        setLoading(true);
        const result = await updateRewardAmount(rule.id, amount);
        if (result.success) {
            setIsEditing(false);
        }
        setLoading(false);
    }

    const title = locale === 'ar' ? rule.title_ar : rule.title_en;

    return (
        <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span
                        className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <p className="font-medium text-gray-900">{title}</p>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{rule.key}</p>
            </div>

            <div className="flex items-center gap-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                            onClick={handleSaveAmount}
                            disabled={loading}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {t('common.save')}
                        </button>
                        <button
                            onClick={() => {
                                setAmount(rule.amount);
                                setIsEditing(false);
                            }}
                            className="px-3 py-1.5 text-gray-600 text-sm"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200"
                    >
                        {amount.toFixed(2)} QANZ
                    </button>
                )}

                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}
