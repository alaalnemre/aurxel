import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getNotifications } from '@/lib/notifications/actions';
import { getProfile } from '@/lib/auth/get-profile';
import { NotificationList } from '@/components/notifications/NotificationList';
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton';
import { Link } from '@/i18n/navigation';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function NotificationsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth check
    const { user } = await getProfile();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const notifications = await getNotifications();

    return <NotificationsContent notifications={notifications} locale={locale} />;
}

function NotificationsContent({
    notifications,
    locale,
}: {
    notifications: Awaited<ReturnType<typeof getNotifications>>;
    locale: string;
}) {
    const t = useTranslations();

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href="/"
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
                        >
                            ← {t('common.back')}
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('notifications.title')}
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-500">
                                {unreadCount} {t('notifications.unread')}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <MarkAllReadButton />
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            🔔
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('notifications.noNotifications')}
                        </h3>
                        <p className="text-gray-500">{t('notifications.noNotificationsDesc')}</p>
                    </div>
                ) : (
                    <NotificationList notifications={notifications} />
                )}
            </div>
        </div>
    );
}
