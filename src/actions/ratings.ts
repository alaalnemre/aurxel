"use server";

import { createUserClient, getUser } from "@/lib/supabase/server";
import type { Rating } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function submitRating(data: {
    orderId: string;
    ratedType: "seller" | "driver" | "product";
    ratedId: string;
    rating: number;
    review?: string;
}): Promise<ActionResult<Rating>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        const supabase = await createUserClient();

        // Verify order belongs to user and is completed
        const { data: order } = await supabase
            .from("orders")
            .select("id, status")
            .eq("id", data.orderId)
            .eq("buyer_id", user.id)
            .maybeSingle();

        if (!order) return { success: false, error: "Order not found" };
        if (order.status !== "completed") {
            return { success: false, error: "Cannot rate incomplete order" };
        }

        // Check for existing rating
        const { data: existing } = await supabase
            .from("ratings")
            .select("id")
            .eq("order_id", data.orderId)
            .eq("rater_id", user.id)
            .eq("rated_type", data.ratedType)
            .eq("rated_id", data.ratedId)
            .maybeSingle();

        if (existing) return { success: false, error: "Already rated" };

        const { data: rating, error } = await supabase
            .from("ratings")
            .insert({
                order_id: data.orderId,
                rater_id: user.id,
                rated_type: data.ratedType,
                rated_id: data.ratedId,
                rating: data.rating,
                review: data.review || null,
            })
            .select()
            .maybeSingle();

        if (error) return { success: false, error: error.message };

        // Award coins for rating
        const { data: buyer } = await supabase
            .from("buyers")
            .select("coins_balance")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (buyer) {
            const coinsReward = 5;
            await supabase
                .from("buyers")
                .update({ coins_balance: buyer.coins_balance + coinsReward })
                .eq("profile_id", user.id);

            await supabase.from("coins_ledger").insert({
                profile_id: user.id,
                type: "credit",
                amount: coinsReward,
                balance_before: buyer.coins_balance,
                balance_after: buyer.coins_balance + coinsReward,
                description: "Rating reward",
                reference_type: "rating",
                reference_id: rating?.id,
            });
        }

        return { success: true, data: rating as Rating };
    } catch {
        return { success: false, error: "Failed to submit rating" };
    }
}

export async function getRatingsForEntity(
    ratedType: "seller" | "driver" | "product",
    ratedId: string,
    options?: { page?: number; limit?: number }
): Promise<ActionResult<{ ratings: Rating[]; total: number; average: number }>> {
    try {
        const supabase = await createUserClient();
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        const { data: ratings, error, count } = await supabase
            .from("ratings")
            .select("*", { count: "exact" })
            .eq("rated_type", ratedType)
            .eq("rated_id", ratedId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) return { success: false, error: error.message };

        // Calculate average
        const all = await supabase
            .from("ratings")
            .select("rating")
            .eq("rated_type", ratedType)
            .eq("rated_id", ratedId);

        const average = all.data?.length
            ? all.data.reduce((sum, r) => sum + r.rating, 0) / all.data.length
            : 0;

        return {
            success: true,
            data: { ratings: ratings as Rating[], total: count || 0, average },
        };
    } catch {
        return { success: false, error: "Failed to get ratings" };
    }
}
