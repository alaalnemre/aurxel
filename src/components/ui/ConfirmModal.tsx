'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = 'danger',
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmModalProps) {
    const t = useTranslations();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    const variantColors = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        info: 'bg-indigo-600 hover:bg-indigo-700',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={loading ? undefined : onCancel}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        {cancelLabel || t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${variantColors[variant]}`}
                    >
                        {loading ? t('common.loading') : confirmLabel || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
