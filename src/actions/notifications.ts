'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

type NotificationType = Database['public']['Enums']['notification_type'];

/**
 * Creates a notification safely.
 * This function handles its own errors and will not throw, so it can be safely
 * called from within critical flows (like order placement) without risk of rollback.
 */
export async function createNotification(
    profileId: string,
    type: NotificationType,
    titleKey: string,
    messageKey: string,
    metadata?: Record<string, any> | null,
    dedupeKey?: string
) {
    try {
        // Use Admin Client to bypass RLS for creating notifications for other users
        const supabase = await createAdminClient();

        // If dedupeKey is provided, check if we recently created a similar notification
        if (dedupeKey) {
            // First check if one exists with this dedupe key
            // Note: We rely on the unique index or a manual check. 
            // Since unique index is on dedupe_key (global), it might conflict if we don't scope it or if we don't want strict uniqueness forever.
            // The migration said unique index on dedupe_key where dedupe_key is not null. 
            // So if we insert duplicate dedupe_key detailed in the request (e.g. order_status:123:delivered), it will fail due to constraint.
            // We should catch that specific error or just try insert/ignore if possible, or check existence.
            // Supabase/Postgres doesn't have easy "ON CONFLICT IGNORE" via JS client for standard inserts unless upsert,
            // but upsert updates the record which changes 'is_read' potentially. 
            // We want to skip if exists.

            // Simple approach: Check existence first. Race condition effectively mitigated by unique constraint (second insert will fail).
            // We treat unique constraint violation as "success - already notified".
        }

        const { error } = await supabase.from('notifications').insert({
            profile_id: profileId,
            type,
            title_key: titleKey,
            message_key: messageKey,
            metadata,
            dedupe_key: dedupeKey,
        });

        if (error) {
            // If unique violation (code 23505), it means already notified. Ignore.
            if (error.code === '23505') {
                // console.log('Notification deduped:', dedupeKey);
                return;
            }
            console.error('[createNotification] Failed to create notification:', error);
        }
    } catch (err) {
        console.error('[createNotification] Unexpected error:', err);
    }
}

/**
 * Get notifications for the current user.
 */
export async function getUserNotifications({
    onlyUnread = false,
    limit = 10,
    page = 1,
}: {
    onlyUnread?: boolean;
    limit?: number;
    page?: number;
} = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: [], count: 0, unreadCount: 0 };
    }

    // Build query
    let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

    if (onlyUnread) {
        query = query.eq('is_read', false);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('[getUserNotifications] Error:', error);
        return { data: [], count: 0, unreadCount: 0 };
    }

    // Get separated unread count
    const { count: unreadCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('is_read', false);

    return {
        data: data || [],
        count: count || 0,
        unreadCount: unreadCount || 0,
    };
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(notificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('profile_id', user.id);

    if (error) {
        console.error('[markNotificationRead] Error:', error);
        return { success: false };
    }

    return { success: true };
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllNotificationsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('profile_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('[markAllNotificationsRead] Error:', error);
        return { success: false };
    }

    return { success: true };
}
