'use client';

import { useTranslations } from 'next-intl';
import { markAllAsRead } from '@/lib/notifications/actions';

export function MarkAllReadButton() {
    const t = useTranslations();

    async function handleClick() {
        await markAllAsRead();
    }

    return (
        <button
            onClick={handleClick}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
            {t('notifications.markAllRead')}
        </button>
    );
}
