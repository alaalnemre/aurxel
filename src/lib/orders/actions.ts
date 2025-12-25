'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import { applyRateLimit, isRateLimitError, getRateLimitMessage } from '@/lib/security/rate-limit';
import type { OrderWithDetails, OrderStatus, CartItem } from '@/lib/types/database';

export interface OrderActionResult {
    success: boolean;
    error?: string;
    orderId?: string;
}

/**
 * Create a new order from cart items
 */
export async function createOrder(
    items: CartItem[],
    deliveryInfo: {
        address: string;
        phone: string;
        notes?: string;
    }
): Promise<OrderActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile) {
        return { success: false, error: 'Not authenticated' };
    }

    // Rate limiting
    try {
        applyRateLimit('CHECKOUT', user.id);
    } catch (error) {
        if (isRateLimitError(error)) {
            return { success: false, error: getRateLimitMessage(locale) };
        }
        throw error;
    }

    if (profile.role !== 'buyer') {
        return { success: false, error: 'Only buyers can create orders' };
    }

    if (items.length === 0) {
        return { success: false, error: 'Cart is empty' };
    }

    // Validate single seller
    const sellerId = items[0].sellerId;
    if (!items.every((item) => item.sellerId === sellerId)) {
        return { success: false, error: 'All items must be from the same seller' };
    }

    // Calculate total
    const totalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            status: 'placed',
            total_amount: totalAmount,
            payment_method: 'cod',
            delivery_address: deliveryInfo.address,
            delivery_phone: deliveryInfo.phone,
            delivery_notes: deliveryInfo.notes || null,
        })
        .select()
        .single();

    if (orderError) {
        console.error('[createOrder] Order error:', orderError);
        return { success: false, error: 'Failed to create order' };
    }

    // Create order items
    const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_name_ar: item.productNameAr,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('[createOrder] Items error:', itemsError);
        // Cleanup order
        await supabase.from('orders').delete().eq('id', order.id);
        return { success: false, error: 'Failed to create order items' };
    }

    // Update product stock (decrement by quantity ordered)
    for (const item of items) {
        const { data: productData } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.productId)
            .maybeSingle();

        if (productData) {
            const newStock = Math.max(0, productData.stock - item.quantity);
            await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.productId);
        }
    }

    revalidatePath(`/${locale}/buyer/orders`);

    return { success: true, orderId: order.id };
}

/**
 * Get orders for the current buyer
 */
export async function getBuyerOrders(): Promise<OrderWithDetails[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*),
      seller:profiles!orders_seller_id_fkey(id, full_name)
    `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getBuyerOrders] Error:', error);
        return [];
    }

    return (data || []) as OrderWithDetails[];
}

/**
 * Get a single order for buyer
 */
export async function getBuyerOrder(orderId: string): Promise<OrderWithDetails | null> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*),
      seller:profiles!orders_seller_id_fkey(id, full_name)
    `)
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getBuyerOrder] Error:', error);
        return null;
    }

    return data as OrderWithDetails | null;
}

/**
 * Get orders for the current seller
 */
export async function getSellerOrders(): Promise<OrderWithDetails[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*),
      buyer:profiles!orders_buyer_id_fkey(id, full_name)
    `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getSellerOrders] Error:', error);
        return [];
    }

    return (data || []) as OrderWithDetails[];
}

/**
 * Get a single order for seller
 */
export async function getSellerOrder(orderId: string): Promise<OrderWithDetails | null> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*),
      buyer:profiles!orders_buyer_id_fkey(id, full_name)
    `)
        .eq('id', orderId)
        .eq('seller_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('[getSellerOrder] Error:', error);
        return null;
    }

    return data as OrderWithDetails | null;
}

/**
 * Update order status (seller only)
 */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
): Promise<OrderActionResult> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { user, profile } = await getProfile();

    if (!user || !profile) {
        return { success: false, error: 'Not authenticated' };
    }

    // Sellers can only update to certain statuses
    const sellerAllowedStatuses: OrderStatus[] = [
        'accepted',
        'preparing',
        'ready_for_pickup',
        'cancelled',
    ];

    if (profile.role === 'seller' && !sellerAllowedStatuses.includes(newStatus)) {
        return { success: false, error: 'Invalid status transition' };
    }

    const updateQuery = supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    // Apply seller filter if not admin
    if (profile.role === 'seller') {
        updateQuery.eq('seller_id', user.id);
    }

    const { error } = await updateQuery;

    if (error) {
        console.error('[updateOrderStatus] Error:', error);
        return { success: false, error: error.message || 'Failed to update status' };
    }

    revalidatePath(`/${locale}/seller/orders`);
    revalidatePath(`/${locale}/seller/orders/${orderId}`);

    return { success: true };
}
