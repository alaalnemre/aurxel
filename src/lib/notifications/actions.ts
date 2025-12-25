'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import type { Notification } from '@/lib/types/database';

/**
 * Get notifications for the current user
 */
export async function getNotifications(limit: number = 50): Promise<Notification[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[getNotifications] Error:', error);
        return [];
    }

    return (data || []) as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return 0;
    }

    // Try RPC first
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.id,
    });

    if (error) {
        // Fallback to direct count
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        return count || 0;
    }

    return data || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user } = await getProfile();

    if (!user) {
        return false;
    }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) {
        console.error('[markAsRead] Error:', error);
        return false;
    }

    revalidatePath(`/${locale}/notifications`);

    return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user } = await getProfile();

    if (!user) {
        return false;
    }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('[markAllAsRead] Error:', error);
        return false;
    }

    revalidatePath(`/${locale}/notifications`);

    return true;
}

/**
 * Create a notification (admin/system use)
 */
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    referenceType?: string,
    referenceId?: string
): Promise<boolean> {
    const supabase = await createClient();
    const locale = await getLocale();

    const { error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
    });

    if (error) {
        console.error('[createNotification] Error:', error);
        return false;
    }

    revalidatePath(`/${locale}/notifications`);

    return true;
}
