'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/actions/notifications';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

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

export default function NotificationsPage() {
    const t = useTranslations('notifications');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const { data, count } = await getUserNotifications({ limit: 20, page });
            setNotifications(data as Notification[]);
            setTotalCount(count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationRead(id);
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await markAllNotificationsRead();
    };

    const formatMessage = (key: string, metadata: any) => {
        try {
            return t(key, metadata || {});
        } catch (e) {
            return key;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        {t('markAllRead')}
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">{t('loading')}</div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🔔</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{t('emptyTitle')}</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">{t('emptyMessage')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-4 hover:bg-gray-50 transition-colors flex gap-4",
                                    !notification.is_read ? "bg-blue-50/30" : "bg-white"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    !notification.is_read ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    {/* Icon based on type */}
                                    {notification.type === 'order_status' && '📦'}
                                    {notification.type === 'discount' && '🏷️'}
                                    {notification.type === 'badge' && '🏆'}
                                    {notification.type === 'featured' && '⭐'}
                                    {notification.type === 'system' && '🔔'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={cn("text-sm font-medium", !notification.is_read ? "text-gray-900" : "text-gray-700")}>
                                            {formatMessage(notification.title_key, notification.metadata)}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={cn("text-sm mt-1", !notification.is_read ? "text-gray-800" : "text-gray-500")}>
                                        {formatMessage(notification.message_key, notification.metadata)}
                                    </p>
                                </div>

                                {!notification.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="self-center p-2 text-gray-400 hover:text-brand-600 transition-colors"
                                        title={t('markRead')}
                                    >
                                        <EnvelopeOpenIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simple Pagination */}
            {totalCount > 20 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-md disabled:opacity-50"
                    >
                        {t('prev')}
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                        {page} / {Math.ceil(totalCount / 20)}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(totalCount / 20)}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-md disabled:opacity-50"
                    >
                        {t('next')}
                    </button>
                </div>
            )}
        </div>
    );
}
