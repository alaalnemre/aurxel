"use server";

import { createUserClient, getUser } from "@/lib/supabase/server";
import type { Delivery, DeliveryStatus, Driver } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface DeliveryWithOrder extends Delivery {
    order: {
        id: string;
        order_number: string;
        total: number;
        buyer_id: string;
        status: string;
    };
    distance?: number;
}

// Valid state transitions
const VALID_DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
    available: ["assigned"],
    assigned: ["picked_up"],
    picked_up: ["delivered"],
    delivered: [],
};

export async function getAvailableDeliveries(): Promise<
    ActionResult<DeliveryWithOrder[]>
> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Verify driver status
        const { data: profile } = await supabase
            .from("profiles")
            .select("driver_verified")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.driver_verified) {
            return { success: false, error: "Not a verified driver" };
        }

        const { data: deliveries, error } = await supabase
            .from("deliveries")
            .select(
                `
        *,
        order:orders(id, order_number, total, buyer_id, status)
      `
            )
            .eq("status", "available")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("[getAvailableDeliveries] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: deliveries as DeliveryWithOrder[] };
    } catch (error) {
        console.error("[getAvailableDeliveries] Exception:", error);
        return { success: false, error: "Failed to get available deliveries" };
    }
}

export async function getDriverDeliveries(): Promise<
    ActionResult<DeliveryWithOrder[]>
> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get driver ID
        const { data: driver } = await supabase
            .from("drivers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!driver) {
            return { success: false, error: "Not a driver" };
        }

        const { data: deliveries, error } = await supabase
            .from("deliveries")
            .select(
                `
        *,
        order:orders(id, order_number, total, buyer_id, status)
      `
            )
            .eq("driver_id", driver.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getDriverDeliveries] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: deliveries as DeliveryWithOrder[] };
    } catch (error) {
        console.error("[getDriverDeliveries] Exception:", error);
        return { success: false, error: "Failed to get driver deliveries" };
    }
}

export async function getActiveDelivery(): Promise<
    ActionResult<DeliveryWithOrder | null>
> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get driver ID
        const { data: driver } = await supabase
            .from("drivers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!driver) {
            return { success: false, error: "Not a driver" };
        }

        const { data: delivery, error } = await supabase
            .from("deliveries")
            .select(
                `
        *,
        order:orders(id, order_number, total, buyer_id, status)
      `
            )
            .eq("driver_id", driver.id)
            .in("status", ["assigned", "picked_up"])
            .maybeSingle();

        if (error) {
            console.error("[getActiveDelivery] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: delivery as DeliveryWithOrder | null };
    } catch (error) {
        console.error("[getActiveDelivery] Exception:", error);
        return { success: false, error: "Failed to get active delivery" };
    }
}

export async function claimDelivery(deliveryId: string): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get driver ID and verify
        const { data: driver } = await supabase
            .from("drivers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!driver) {
            return { success: false, error: "Not a driver" };
        }

        // Verify driver is verified
        const { data: profile } = await supabase
            .from("profiles")
            .select("driver_verified")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.driver_verified) {
            return { success: false, error: "Driver not verified" };
        }

        // Check if driver already has an active delivery
        const { data: activeDelivery } = await supabase
            .from("deliveries")
            .select("id")
            .eq("driver_id", driver.id)
            .in("status", ["assigned", "picked_up"])
            .maybeSingle();

        if (activeDelivery) {
            return { success: false, error: "You already have an active delivery" };
        }

        // Get delivery and verify it's available
        const { data: delivery } = await supabase
            .from("deliveries")
            .select("status, order_id")
            .eq("id", deliveryId)
            .maybeSingle();

        if (!delivery) {
            return { success: false, error: "Delivery not found" };
        }

        if (delivery.status !== "available") {
            return { success: false, error: "Delivery is not available" };
        }

        // Assign delivery to driver (trigger will validate transition)
        const { error } = await supabase
            .from("deliveries")
            .update({
                driver_id: driver.id,
                status: "assigned",
                estimated_pickup_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins
                estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 mins
            })
            .eq("id", deliveryId)
            .eq("status", "available"); // Extra safety check

        if (error) {
            console.error("[claimDelivery] Error:", error);
            return { success: false, error: error.message };
        }

        // Create delivery request record
        await supabase.from("delivery_requests").insert({
            delivery_id: deliveryId,
            driver_id: driver.id,
            status: "accepted",
            responded_at: new Date().toISOString(),
        });

        // Get order details for notification
        const { data: order } = await supabase
            .from("orders")
            .select("buyer_id, order_number")
            .eq("id", delivery.order_id)
            .maybeSingle();

        if (order) {
            await supabase.from("notifications").insert({
                profile_id: order.buyer_id,
                type: "delivery_update",
                title: "Driver Assigned",
                title_ar: "تم تعيين سائق",
                message: `A driver has been assigned to your order #${order.order_number}`,
                message_ar: `تم تعيين سائق لطلبك #${order.order_number}`,
                data: { delivery_id: deliveryId, order_id: delivery.order_id },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("[claimDelivery] Exception:", error);
        return { success: false, error: "Failed to claim delivery" };
    }
}

export async function updateDeliveryStatus(
    deliveryId: string,
    newStatus: DeliveryStatus
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get driver ID
        const { data: driver } = await supabase
            .from("drivers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!driver) {
            return { success: false, error: "Not a driver" };
        }

        // Get delivery and verify ownership
        const { data: delivery } = await supabase
            .from("deliveries")
            .select("status, driver_id, order_id")
            .eq("id", deliveryId)
            .maybeSingle();

        if (!delivery) {
            return { success: false, error: "Delivery not found" };
        }

        if (delivery.driver_id !== driver.id) {
            return { success: false, error: "Unauthorized" };
        }

        const currentStatus = delivery.status as DeliveryStatus;

        // Validate transition
        const validTransitions = VALID_DELIVERY_TRANSITIONS[currentStatus];
        if (!validTransitions?.includes(newStatus)) {
            return {
                success: false,
                error: `Invalid transition from ${currentStatus} to ${newStatus}`,
            };
        }

        // Update delivery (trigger will validate and set timestamps)
        const { error } = await supabase
            .from("deliveries")
            .update({ status: newStatus })
            .eq("id", deliveryId);

        if (error) {
            console.error("[updateDeliveryStatus] Error:", error);
            return { success: false, error: error.message };
        }

        // If delivered, mark order as completed
        if (newStatus === "delivered") {
            await supabase
                .from("orders")
                .update({ status: "completed", completed_at: new Date().toISOString() })
                .eq("id", delivery.order_id);

            // Earn coins for buyer
            const { data: order } = await supabase
                .from("orders")
                .select("buyer_id, total")
                .eq("id", delivery.order_id)
                .maybeSingle();

            if (order) {
                const coinsToEarn = Math.floor(Number(order.total));
                const { data: buyer } = await supabase
                    .from("buyers")
                    .select("coins_balance")
                    .eq("profile_id", order.buyer_id)
                    .maybeSingle();

                if (buyer) {
                    await supabase
                        .from("buyers")
                        .update({ coins_balance: buyer.coins_balance + coinsToEarn })
                        .eq("profile_id", order.buyer_id);

                    await supabase.from("coins_ledger").insert({
                        profile_id: order.buyer_id,
                        type: "credit",
                        amount: coinsToEarn,
                        balance_before: buyer.coins_balance,
                        balance_after: buyer.coins_balance + coinsToEarn,
                        description: "Order completion reward",
                        reference_type: "order",
                        reference_id: delivery.order_id,
                    });
                }
            }
        }

        // Create notification
        const { data: order } = await supabase
            .from("orders")
            .select("buyer_id, order_number")
            .eq("id", delivery.order_id)
            .maybeSingle();

        if (order) {
            const statusMessages: Record<DeliveryStatus, { en: string; ar: string }> = {
                available: { en: "Available", ar: "متاح" },
                assigned: { en: "Driver Assigned", ar: "تم تعيين سائق" },
                picked_up: { en: "Order Picked Up", ar: "تم استلام الطلب" },
                delivered: { en: "Order Delivered", ar: "تم تسليم الطلب" },
            };

            await supabase.from("notifications").insert({
                profile_id: order.buyer_id,
                type: "delivery_update",
                title: statusMessages[newStatus].en,
                title_ar: statusMessages[newStatus].ar,
                message: `Your order #${order.order_number} delivery status: ${statusMessages[newStatus].en}`,
                message_ar: `حالة توصيل طلبك #${order.order_number}: ${statusMessages[newStatus].ar}`,
                data: { delivery_id: deliveryId, status: newStatus },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("[updateDeliveryStatus] Exception:", error);
        return { success: false, error: "Failed to update delivery status" };
    }
}

// Driver shortcuts
export async function pickupDelivery(deliveryId: string): Promise<ActionResult> {
    return updateDeliveryStatus(deliveryId, "picked_up");
}

export async function completeDelivery(deliveryId: string): Promise<ActionResult> {
    return updateDeliveryStatus(deliveryId, "delivered");
}

export async function updateDriverLocation(
    latitude: number,
    longitude: number
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        const { error } = await supabase
            .from("drivers")
            .update({
                current_latitude: latitude,
                current_longitude: longitude,
                updated_at: new Date().toISOString(),
            })
            .eq("profile_id", user.id);

        if (error) {
            console.error("[updateDriverLocation] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[updateDriverLocation] Exception:", error);
        return { success: false, error: "Failed to update location" };
    }
}

export async function toggleDriverOnline(isOnline: boolean): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        const { error } = await supabase
            .from("drivers")
            .update({
                is_online: isOnline,
                updated_at: new Date().toISOString(),
            })
            .eq("profile_id", user.id);

        if (error) {
            console.error("[toggleDriverOnline] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[toggleDriverOnline] Exception:", error);
        return { success: false, error: "Failed to toggle online status" };
    }
}

export async function getDriverStats(): Promise<
    ActionResult<{
        totalDeliveries: number;
        totalEarnings: number;
        totalTips: number;
        rating: number;
    }>
> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        const { data: driver } = await supabase
            .from("drivers")
            .select("id, total_deliveries, rating_average")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!driver) {
            return { success: false, error: "Not a driver" };
        }

        // Get tips
        const { data: tips } = await supabase
            .from("tips")
            .select("amount")
            .eq("driver_id", driver.id);

        const totalTips = tips?.reduce((sum, tip) => sum + Number(tip.amount), 0) || 0;

        // Earnings: delivery fee per completed delivery (simplified)
        const deliveryFeePerOrder = 2.5;
        const totalEarnings = driver.total_deliveries * deliveryFeePerOrder;

        return {
            success: true,
            data: {
                totalDeliveries: driver.total_deliveries,
                totalEarnings,
                totalTips,
                rating: Number(driver.rating_average),
            },
        };
    } catch (error) {
        console.error("[getDriverStats] Exception:", error);
        return { success: false, error: "Failed to get driver stats" };
    }
}
