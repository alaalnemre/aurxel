'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { getUnreadCount } from '@/lib/notifications/actions';

interface NotificationBellProps {
    initialCount?: number;
}

export function NotificationBell({ initialCount = 0 }: NotificationBellProps) {
    const t = useTranslations();
    const [count, setCount] = useState(initialCount);

    // Optionally refresh count periodically (not every second!)
    useEffect(() => {
        const refreshCount = async () => {
            const newCount = await getUnreadCount();
            setCount(newCount);
        };

        // Refresh every 60 seconds
        const interval = setInterval(refreshCount, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Link
            href="/notifications"
            className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label={t('notifications.viewAll')}
        >
            <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
