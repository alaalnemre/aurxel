'use client';

import { useTranslations } from 'next-intl';
import { markAsRead } from '@/lib/notifications/actions';
import type { Notification } from '@/lib/types/database';

interface NotificationListProps {
    notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
    const t = useTranslations();

    const typeIcons: Record<string, string> = {
        order_status: '📦',
        delivery_assigned: '🚗',
        delivery_picked_up: '📦',
        delivery_completed: '✅',
        cash_confirmed: '💵',
        qanz_topup: '💳',
    };

    async function handleClick(notification: Notification) {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {notifications.map((notification) => (
                <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-indigo-50/50' : ''
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                            {typeIcons[notification.type] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                </p>
                                {!notification.is_read && (
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
