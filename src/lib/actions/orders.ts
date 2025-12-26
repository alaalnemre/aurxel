'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type OrderActionResult = {
    error?: string;
    orderId?: string;
};

interface OrderItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

interface CreateOrderParams {
    sellerId: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryFee: number;
    deliveryAddress: string;
    deliveryPhone: string;
    notes: string | null;
}

export async function createOrder(params: CreateOrderParams): Promise<OrderActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const {
        sellerId,
        items,
        totalAmount,
        deliveryFee,
        deliveryAddress,
        deliveryPhone,
        notes,
    } = params;

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            status: 'placed',
            total_amount: totalAmount,
            delivery_fee: deliveryFee,
            delivery_address: deliveryAddress,
            delivery_phone: deliveryPhone,
            notes,
        })
        .select('id')
        .maybeSingle();

    if (orderError || !order) {
        console.error('[createOrder]', orderError);
        return { error: orderError?.message || 'Failed to create order' };
    }

    // Create order items
    const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('[createOrder items]', itemsError);
        // Rollback order
        await supabase.from('orders').delete().eq('id', order.id);
        return { error: 'Failed to create order items' };
    }

    // Create delivery record
    const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
            order_id: order.id,
            status: 'available',
        });

    if (deliveryError) {
        console.error('[createOrder delivery]', deliveryError);
    }

    // Update product stock
    for (const item of items) {
        await supabase.rpc('decrement_stock', {
            product_id: item.productId,
            quantity: item.quantity,
        });
    }

    revalidatePath('/buyer/orders');
    revalidatePath('/seller/orders');
    revalidatePath('/driver/deliveries');

    return { orderId: order.id };
}

export async function getOrderById(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: order } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(
        id,
        quantity,
        unit_price,
        product:products(id, name_en, name_ar, images)
      ),
      seller:profiles!orders_seller_id_fkey(full_name),
      seller_profile:seller_profiles!orders_seller_id_fkey(business_name),
      delivery:deliveries(*)
    `)
        .eq('id', orderId)
        .maybeSingle();

    return order;
}

export async function getBuyerOrders() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: orders } = await supabase
        .from('orders')
        .select(`
      id,
      status,
      total_amount,
      delivery_fee,
      created_at,
      seller_profile:seller_profiles!orders_seller_id_fkey(business_name)
    `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    return orders || [];
}

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<OrderActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify order belongs to seller
    const { data: order } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('id', orderId)
        .maybeSingle();

    if (!order || order.seller_id !== user.id) {
        return { error: 'Order not found' };
    }

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error('[updateOrderStatus]', error);
        return { error: error.message };
    }

    revalidatePath('/seller/orders');
    revalidatePath('/buyer/orders');
    revalidatePath('/driver/deliveries');

    return { orderId };
}
