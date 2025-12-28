"use server";

import { createUserClient, createAdminClient, getUser } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus, Delivery } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
    delivery?: Delivery;
    seller_name?: string;
}

// Valid state transitions
const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    placed: ["accepted", "cancelled"],
    accepted: ["preparing", "cancelled"],
    preparing: ["ready_for_pickup", "cancelled"],
    ready_for_pickup: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

export async function createOrder(data: {
    delivery_address: {
        address_line_1: string;
        address_line_2?: string;
        city: string;
        area?: string;
        notes?: string;
        latitude?: number;
        longitude?: number;
    };
    notes?: string;
    use_coins?: number;
    discount_code?: string;
}): Promise<ActionResult<Order>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get cart with items
        const { data: cart, error: cartError } = await supabase
            .from("carts")
            .select(
                `
        id,
        items:cart_items(
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          product:products(
            id,
            name,
            seller_id,
            stock_quantity,
            is_active,
            seller:sellers(id, profile_id, business_address)
          ),
          variant:product_variants(id, name, stock_quantity, is_active)
        )
      `
            )
            .eq("profile_id", user.id)
            .maybeSingle();

        if (cartError) {
            console.error("[createOrder] Cart error:", cartError);
            return { success: false, error: cartError.message };
        }

        if (!cart || !cart.items || cart.items.length === 0) {
            return { success: false, error: "Cart is empty" };
        }

        // Group items by seller
        const itemsBySeller = new Map<string, typeof cart.items>();

        for (const item of cart.items) {
            const product = item.product as unknown as {
                seller_id: string;
                stock_quantity: number;
                is_active: boolean;
                name: string;
            } | null;

            if (!product || !product.is_active) {
                return { success: false, error: `Product not available` };
            }

            const variant = item.variant as unknown as { stock_quantity: number; is_active: boolean; name: string } | null;
            const availableStock = variant?.stock_quantity ?? product.stock_quantity;

            if (item.quantity > availableStock) {
                return { success: false, error: `Insufficient stock for ${product.name}` };
            }

            const sellerId = product.seller_id;
            if (!itemsBySeller.has(sellerId)) {
                itemsBySeller.set(sellerId, []);
            }
            itemsBySeller.get(sellerId)!.push(item);
        }

        // For now, we only support single-seller orders
        if (itemsBySeller.size > 1) {
            return { success: false, error: "Orders from multiple sellers not supported yet" };
        }

        const [sellerId, items] = [...itemsBySeller.entries()][0]!;

        // Calculate subtotal
        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.unit_price) * item.quantity,
            0
        );

        // Get coins balance if using coins
        let coinsDiscount = 0;
        let coinsUsed = 0;
        if (data.use_coins && data.use_coins > 0) {
            const { data: buyer } = await supabase
                .from("buyers")
                .select("coins_balance")
                .eq("profile_id", user.id)
                .maybeSingle();

            if (buyer && buyer.coins_balance >= data.use_coins) {
                coinsUsed = Math.min(data.use_coins, buyer.coins_balance);
                coinsDiscount = coinsUsed * 0.01; // 1 coin = 0.01 JOD
            }
        }

        // Apply discount code if provided
        let discountAmount = 0;
        if (data.discount_code) {
            const { data: discount } = await supabase
                .from("discounts")
                .select("*")
                .eq("code", data.discount_code.toUpperCase())
                .eq("is_active", true)
                .gte("valid_until", new Date().toISOString())
                .lte("valid_from", new Date().toISOString())
                .maybeSingle();

            if (discount) {
                if (discount.min_order_amount && subtotal < Number(discount.min_order_amount)) {
                    return { success: false, error: "Order does not meet minimum amount for discount" };
                }

                if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
                    return { success: false, error: "Discount code usage limit reached" };
                }

                if (discount.discount_type === "percentage") {
                    discountAmount = subtotal * (Number(discount.discount_value) / 100);
                    if (discount.max_discount_amount) {
                        discountAmount = Math.min(discountAmount, Number(discount.max_discount_amount));
                    }
                } else {
                    discountAmount = Number(discount.discount_value);
                }

                // Increment usage count
                await supabase
                    .from("discounts")
                    .update({ usage_count: discount.usage_count + 1 })
                    .eq("id", discount.id);
            }
        }

        const deliveryFee = 2.5; // Fixed delivery fee
        const total = Math.max(0, subtotal + deliveryFee - discountAmount - coinsDiscount);

        // Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                buyer_id: user.id,
                seller_id: sellerId,
                status: "placed",
                subtotal,
                delivery_fee: deliveryFee,
                discount_amount: discountAmount,
                coins_used: coinsUsed,
                coins_discount: coinsDiscount,
                total,
                delivery_address: data.delivery_address,
                notes: data.notes || null,
            })
            .select()
            .maybeSingle();

        if (orderError) {
            console.error("[createOrder] Order error:", orderError);
            return { success: false, error: orderError.message };
        }

        // Create order items
        const orderItems = items.map((item) => ({
            order_id: order!.id,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            product_name: ((item.product as unknown as { name: string }) || { name: 'Product' }).name,
            variant_name: ((item.variant as unknown as { name: string } | null))?.name || null,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.unit_price) * item.quantity,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

        if (itemsError) {
            console.error("[createOrder] Items error:", itemsError);
            // Rollback order
            await supabase.from("orders").delete().eq("id", order!.id);
            return { success: false, error: itemsError.message };
        }

        // Get seller address for pickup
        const firstItem = items[0];
        const sellerAddress = ((firstItem?.product as unknown as { seller: { business_address: string } })?.seller)?.business_address || "Seller Location";

        // Create delivery record
        const { error: deliveryError } = await supabase.from("deliveries").insert({
            order_id: order!.id,
            status: "available",
            pickup_address: { address: sellerAddress },
            delivery_address: data.delivery_address,
        });

        if (deliveryError) {
            console.error("[createOrder] Delivery error:", deliveryError);
        }

        // Deduct coins if used
        if (coinsUsed > 0) {
            const { data: buyer } = await supabase
                .from("buyers")
                .select("coins_balance")
                .eq("profile_id", user.id)
                .maybeSingle();

            if (buyer) {
                await supabase
                    .from("buyers")
                    .update({ coins_balance: buyer.coins_balance - coinsUsed })
                    .eq("profile_id", user.id);

                await supabase.from("coins_ledger").insert({
                    profile_id: user.id,
                    type: "debit",
                    amount: coinsUsed,
                    balance_before: buyer.coins_balance,
                    balance_after: buyer.coins_balance - coinsUsed,
                    description: `Used for order ${order!.order_number}`,
                    reference_type: "order",
                    reference_id: order!.id,
                });
            }
        }

        // Update stock
        for (const item of items) {
            if (item.variant_id) {
                await supabase
                    .from("product_variants")
                    .update({
                        stock_quantity: (((item.variant as unknown as { stock_quantity: number })).stock_quantity) - item.quantity,
                    })
                    .eq("id", item.variant_id);
            } else {
                await supabase
                    .from("products")
                    .update({
                        stock_quantity: (((item.product as unknown as { stock_quantity: number })).stock_quantity) - item.quantity,
                    })
                    .eq("id", item.product_id);
            }
        }

        // Clear cart
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);

        // Create notification for seller
        const { data: seller } = await supabase
            .from("sellers")
            .select("profile_id")
            .eq("id", sellerId)
            .maybeSingle();

        if (seller) {
            await supabase.from("notifications").insert({
                profile_id: seller.profile_id,
                type: "order_update",
                title: "New Order Received",
                title_ar: "طلب جديد",
                message: `You have received a new order #${order!.order_number}`,
                message_ar: `لقد استلمت طلباً جديداً #${order!.order_number}`,
                data: { order_id: order!.id },
            });
        }

        return { success: true, data: order as Order };
    } catch (error) {
        console.error("[createOrder] Exception:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function getOrders(): Promise<ActionResult<OrderWithItems[]>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        const { data: orders, error } = await supabase
            .from("orders")
            .select(
                `
        *,
        items:order_items(*),
        delivery:deliveries(*),
        seller:sellers(business_name)
      `
            )
            .eq("buyer_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getOrders] Error:", error);
            return { success: false, error: error.message };
        }

        const ordersWithSellerName = orders?.map((order) => ({
            ...order,
            seller_name: ((order.seller as unknown as { business_name: string }))?.business_name,
        })) || [];

        return { success: true, data: ordersWithSellerName as OrderWithItems[] };
    } catch (error) {
        console.error("[getOrders] Exception:", error);
        return { success: false, error: "Failed to get orders" };
    }
}

export async function getOrderById(
    orderId: string
): Promise<ActionResult<OrderWithItems>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        const { data: order, error } = await supabase
            .from("orders")
            .select(
                `
        *,
        items:order_items(*),
        delivery:deliveries(*),
        seller:sellers(business_name, profile_id)
      `
            )
            .eq("id", orderId)
            .maybeSingle();

        if (error) {
            console.error("[getOrderById] Error:", error);
            return { success: false, error: error.message };
        }

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        // Verify access
        const sellerProfileId = ((order.seller as unknown as { profile_id: string }))?.profile_id;
        if (order.buyer_id !== user.id && sellerProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        return {
            success: true,
            data: {
                ...order,
                seller_name: ((order.seller as unknown as { business_name: string }))?.business_name,
            } as OrderWithItems,
        };
    } catch (error) {
        console.error("[getOrderById] Exception:", error);
        return { success: false, error: "Failed to get order" };
    }
}

export async function getSellerOrders(): Promise<ActionResult<OrderWithItems[]>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get seller ID
        const { data: seller } = await supabase
            .from("sellers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!seller) {
            return { success: false, error: "Not a seller" };
        }

        const { data: orders, error } = await supabase
            .from("orders")
            .select(
                `
        *,
        items:order_items(*),
        delivery:deliveries(*)
      `
            )
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getSellerOrders] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: orders as OrderWithItems[] };
    } catch (error) {
        console.error("[getSellerOrders] Exception:", error);
        return { success: false, error: "Failed to get seller orders" };
    }
}

// State machine transitions
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    reason?: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get current order
        const { data: order } = await supabase
            .from("orders")
            .select("status, seller_id, buyer_id, total, sellers!inner(profile_id)")
            .eq("id", orderId)
            .maybeSingle();

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        const currentStatus = order.status as OrderStatus;
        const sellerProfileId = ((order as unknown as { sellers: { profile_id: string } }).sellers).profile_id;

        // Verify authorization
        const isSeller = sellerProfileId === user.id;
        const isBuyer = order.buyer_id === user.id;

        // Only sellers can accept, prepare, mark ready, complete
        // Only buyers can cancel (within allowed states)
        if (newStatus === "cancelled") {
            if (!isBuyer && !isSeller) {
                return { success: false, error: "Unauthorized" };
            }
        } else {
            if (!isSeller) {
                return { success: false, error: "Only seller can update order status" };
            }
        }

        // Validate transition using state machine
        const validTransitions = VALID_ORDER_TRANSITIONS[currentStatus];
        if (!validTransitions?.includes(newStatus)) {
            return {
                success: false,
                error: `Invalid transition from ${currentStatus} to ${newStatus}`,
            };
        }

        // Update order status (trigger will validate and set timestamps)
        const updateData: Record<string, unknown> = { status: newStatus };
        if (newStatus === "cancelled" && reason) {
            updateData.cancellation_reason = reason;
        }

        const { error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", orderId);

        if (error) {
            console.error("[updateOrderStatus] Error:", error);
            return { success: false, error: error.message };
        }

        // Handle cancellation refunds
        if (newStatus === "cancelled") {
            // If order was placed, refund coins
            const { data: orderDetails } = await supabase
                .from("orders")
                .select("coins_used")
                .eq("id", orderId)
                .maybeSingle();

            if (orderDetails && orderDetails.coins_used > 0) {
                const { data: buyer } = await supabase
                    .from("buyers")
                    .select("coins_balance")
                    .eq("profile_id", order.buyer_id)
                    .maybeSingle();

                if (buyer) {
                    await supabase
                        .from("buyers")
                        .update({ coins_balance: buyer.coins_balance + orderDetails.coins_used })
                        .eq("profile_id", order.buyer_id);

                    await supabase.from("coins_ledger").insert({
                        profile_id: order.buyer_id,
                        type: "refund",
                        amount: orderDetails.coins_used,
                        balance_before: buyer.coins_balance,
                        balance_after: buyer.coins_balance + orderDetails.coins_used,
                        description: "Order cancellation refund",
                        reference_type: "order",
                        reference_id: orderId,
                    });
                }
            }
        }

        // Create notification
        await supabase.from("notifications").insert({
            profile_id: order.buyer_id,
            type: "order_update",
            title: `Order ${newStatus.replace("_", " ")}`,
            title_ar: getStatusArabic(newStatus),
            message: `Your order status has been updated to ${newStatus.replace("_", " ")}`,
            message_ar: `تم تحديث حالة طلبك إلى ${getStatusArabic(newStatus)}`,
            data: { order_id: orderId, status: newStatus },
        });

        return { success: true };
    } catch (error) {
        console.error("[updateOrderStatus] Exception:", error);
        return { success: false, error: "Failed to update order status" };
    }
}

function getStatusArabic(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
        placed: "تم الطلب",
        accepted: "تم القبول",
        preparing: "قيد التحضير",
        ready_for_pickup: "جاهز للاستلام",
        completed: "مكتمل",
        cancelled: "ملغي",
    };
    return statusMap[status] || status;
}

// Seller-specific shortcuts
export async function acceptOrder(orderId: string): Promise<ActionResult> {
    return updateOrderStatus(orderId, "accepted");
}

export async function startPreparing(orderId: string): Promise<ActionResult> {
    return updateOrderStatus(orderId, "preparing");
}

export async function markOrderReady(orderId: string): Promise<ActionResult> {
    return updateOrderStatus(orderId, "ready_for_pickup");
}

export async function completeOrder(orderId: string): Promise<ActionResult> {
    return updateOrderStatus(orderId, "completed");
}

export async function cancelOrder(
    orderId: string,
    reason?: string
): Promise<ActionResult> {
    return updateOrderStatus(orderId, "cancelled", reason);
}
