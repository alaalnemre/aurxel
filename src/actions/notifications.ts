"use server";

import { createUserClient, getUser } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function getNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}): Promise<ActionResult<{ notifications: Notification[]; total: number; unreadCount: number }>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from("notifications")
            .select("*", { count: "exact" })
            .eq("profile_id", user.id);

        if (options?.unreadOnly) {
            query = query.eq("is_read", false);
        }

        const { data: notifications, error, count } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) return { success: false, error: error.message };

        const { count: unreadCount } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .eq("is_read", false);

        return {
            success: true,
            data: {
                notifications: notifications as Notification[],
                total: count || 0,
                unreadCount: unreadCount || 0,
            },
        };
    } catch {
        return { success: false, error: "Failed to get notifications" };
    }
}

export async function markAsRead(notificationId: string): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notificationId)
            .eq("profile_id", user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: "Failed to mark as read" };
    }
}

export async function markAllAsRead(): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("profile_id", user.id)
            .eq("is_read", false);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: "Failed to mark all as read" };
    }
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
    try {
        const user = await getUser();
        if (!user) return { success: true, data: 0 };

        const supabase = await createUserClient();
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", user.id)
            .eq("is_read", false);

        if (error) return { success: false, error: error.message };
        return { success: true, data: count || 0 };
    } catch {
        return { success: true, data: 0 };
    }
}
