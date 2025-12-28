"use server";

import { createUserClient, createAdminClient, getUser } from "@/lib/supabase/server";
import type { Dispute, DisputeStatus } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function createDispute(data: {
    orderId: string;
    reason: string;
    description: string;
}): Promise<ActionResult<Dispute>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();

        // Verify order belongs to user
        const { data: order } = await supabase
            .from("orders")
            .select("id")
            .eq("id", data.orderId)
            .eq("buyer_id", user.id)
            .maybeSingle();

        if (!order) return { success: false, error: "Order not found" };

        // Check for existing dispute
        const { data: existing } = await supabase
            .from("disputes")
            .select("id")
            .eq("order_id", data.orderId)
            .eq("raised_by", user.id)
            .maybeSingle();

        if (existing) return { success: false, error: "Dispute already exists" };

        const { data: dispute, error } = await supabase
            .from("disputes")
            .insert({
                order_id: data.orderId,
                raised_by: user.id,
                reason: data.reason,
                description: data.description,
                status: "open",
            })
            .select()
            .maybeSingle();

        if (error) return { success: false, error: error.message };
        return { success: true, data: dispute as Dispute };
    } catch {
        return { success: false, error: "Failed to create dispute" };
    }
}

export async function getMyDisputes(): Promise<ActionResult<Dispute[]>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: disputes, error } = await supabase
            .from("disputes")
            .select("*")
            .eq("raised_by", user.id)
            .order("created_at", { ascending: false });

        if (error) return { success: false, error: error.message };
        return { success: true, data: disputes as Dispute[] };
    } catch {
        return { success: false, error: "Failed to get disputes" };
    }
}

export async function adminGetDisputes(
    status?: DisputeStatus
): Promise<ActionResult<Dispute[]>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.is_admin) return { success: false, error: "Unauthorized" };

        const adminClient = await createAdminClient();
        let query = adminClient.from("disputes").select("*");

        if (status) query = query.eq("status", status);

        const { data: disputes, error } = await query.order("created_at", { ascending: false });

        if (error) return { success: false, error: error.message };
        return { success: true, data: disputes as Dispute[] };
    } catch {
        return { success: false, error: "Failed to get disputes" };
    }
}

export async function adminResolveDispute(
    disputeId: string,
    resolution: string,
    newStatus: DisputeStatus
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.is_admin) return { success: false, error: "Unauthorized" };

        const adminClient = await createAdminClient();
        const { error } = await adminClient
            .from("disputes")
            .update({
                status: newStatus,
                resolution,
                resolved_by: user.id,
                resolved_at: new Date().toISOString(),
            })
            .eq("id", disputeId);

        if (error) return { success: false, error: error.message };

        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            action: "resolve_dispute",
            entity_type: "dispute",
            entity_id: disputeId,
            new_data: { status: newStatus, resolution },
        });

        return { success: true };
    } catch {
        return { success: false, error: "Failed to resolve dispute" };
    }
}

export async function addTip(data: {
    deliveryId: string;
    amount: number;
}): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        if (data.amount <= 0) {
            return { success: false, error: "Tip amount must be positive" };
        }

        const supabase = await createUserClient();

        const { data: delivery } = await supabase
            .from("deliveries")
            .select("id, driver_id, order:orders!inner(buyer_id)")
            .eq("id", data.deliveryId)
            .eq("status", "delivered")
            .maybeSingle();

        if (!delivery) return { success: false, error: "Delivery not found" };

        const buyerId = ((delivery as unknown as { order: { buyer_id: string } }).order).buyer_id;
        if (buyerId !== user.id) return { success: false, error: "Unauthorized" };

        if (!delivery.driver_id) return { success: false, error: "No driver assigned" };

        const { error } = await supabase.from("tips").insert({
            delivery_id: data.deliveryId,
            driver_id: delivery.driver_id,
            buyer_id: user.id,
            amount: data.amount,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: "Failed to add tip" };
    }
}
