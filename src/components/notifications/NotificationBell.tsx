'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserNotifications, markNotificationRead } from '@/actions/notifications';
import { BellIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';

// Types matches database
interface Notification {
    id: string;
    type: string;
    title_key: string;
    message_key: string;
    metadata: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Poll for notifications every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { unreadCount, data } = await getUserNotifications({ limit: 5 });
            setUnreadCount(unreadCount);
            setRecentNotifications(data as Notification[]);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setRecentNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markNotificationRead(id);
    };

    const formatMessage = (key: string, metadata: any) => {
        try {
            // Check if metadata exists and pass it to t()
            return t(key, metadata || {});
        } catch (e) {
            return key; // Fallback
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
                aria-label={t('notifications')}
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <Transition
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">{t('notifications')}</h3>
                        <Link href={`/${locale}/notifications`} className="text-xs text-brand-600 hover:text-brand-700" onClick={() => setIsOpen(false)}>
                            {t('viewAll')}
                        </Link>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {recentNotifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                {t('empty')}
                            </div>
                        ) : (
                            recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                                        !notification.is_read && "bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {formatMessage(notification.title_key, notification.metadata)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                {formatMessage(notification.message_key, notification.metadata)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="h-2 w-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0"
                                                title={t('markRead')}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                        <Link href={`/${locale}/notifications`} className="text-xs font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                            {t('viewAllHistory')}
                        </Link>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
