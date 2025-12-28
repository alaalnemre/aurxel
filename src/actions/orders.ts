'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';
// ... (imports)
import { createNotification } from './notifications';
import { applyDiscountToOrder } from './discounts';

// Schemas
const placeOrderSchema = z.object({
    address: z.string().min(5, 'Address is too short'),
    city: z.string().min(2, 'City is required'),
    phone: z.string().min(10, 'Phone number is required'),
    notes: z.string().optional(),
    discountCodeId: z.string().uuid().optional(),
    discountAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

const cancelOrderSchema = z.object({
    orderId: z.string().uuid(),
    reason: z.string().optional(),
});

// Cart Summary
export async function getCartSummary(): Promise<ActionResult<{
    items: any[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
}>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*, products(title, price_jod, stock)')
        .eq('profile_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    const items = cartItems || [];
    const subtotal = items.reduce((sum, item) => {
        const product = item.products as any;
        return sum + (product?.price_jod || 0) * item.quantity;
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryFee = 2.0;

    return {
        success: true,
        data: {
            items,
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
            itemCount
        }
    };
}

// Place Order
export async function buyerPlaceOrder(formData: FormData): Promise<ActionResult<{ orderId: string }>> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        phone: formData.get('phone') as string,
        notes: formData.get('notes') as string || undefined,
        discountCodeId: formData.get('discountCodeId') as string || undefined,
        discountAmount: formData.get('discountAmount') as string || undefined,
    };

    const validation = placeOrderSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { address, city, phone, notes, discountCodeId, discountAmount } = validation.data;

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('id, quantity, product_id')
        .eq('profile_id', user.id);

    if (cartError) {
        console.error('[buyerPlaceOrder] Error fetching cart:', cartError);
        return { success: false, error: 'Failed to fetch cart' };
    }

    if (!cartItems || cartItems.length === 0) {
        return { success: false, error: 'Cart is empty' };
    }

    // Fetch products and seller info
    const productIds = cartItems.map(item => item.product_id);
    const { data: products } = await supabase
        .from('products')
        .select('id, title, price_jod, stock, seller_id, is_active, sellers(id, profile_id)')
        .in('id', productIds);

    if (!products) {
        return { success: false, error: 'Failed to fetch products' };
    }

    // Map products
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate and group by seller
    const ordersBySeller: Record<string, {
        items: { cartItemId: string; productId: string; quantity: number; title: string; price: number; stock: number }[];
        subtotal: number;
        sellerProfileId: string;
    }> = {};

    for (const item of cartItems) {
        const product = productMap.get(item.product_id);

        if (!product || !product.is_active) {
            return { success: false, error: 'Product is no longer available' };
        }

        if (item.quantity > product.stock) {
            return { success: false, error: `Not enough stock for ${product.title}` };
        }

        const seller = product.sellers as any; // Type assertion since joined
        if (!ordersBySeller[product.seller_id]) {
            ordersBySeller[product.seller_id] = {
                items: [],
                subtotal: 0,
                sellerProfileId: seller?.profile_id
            };
        }

        ordersBySeller[product.seller_id].items.push({
            cartItemId: item.id,
            productId: product.id,
            quantity: item.quantity,
            title: product.title,
            price: product.price_jod,
            stock: product.stock,
        });
        ordersBySeller[product.seller_id].subtotal += product.price_jod * item.quantity;
    }

    const createdOrderIds: string[] = [];
    const deliveryFee = 2.00;

    // Calculate discount per order
    const orderDiscountAmount = discountAmount || 0;
    let discountApplied = false;

    // Create orders for each seller
    for (const [sellerId, orderData] of Object.entries(ordersBySeller)) {
        const thisOrderDiscount = !discountApplied && orderDiscountAmount > 0
            ? Math.min(orderDiscountAmount, orderData.subtotal)
            : 0;
        const total = orderData.subtotal + deliveryFee - thisOrderDiscount;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                buyer_profile_id: user.id,
                seller_id: sellerId,
                status: 'placed',
                subtotal: orderData.subtotal,
                delivery_fee: deliveryFee,
                total,
                discount_code_id: thisOrderDiscount > 0 ? discountCodeId : null,
                discount_amount: thisOrderDiscount,
                address,
                city,
                phone,
                notes,
            })
            .select('id')
            .single();

        if (orderError || !order) {
            console.error('[buyerPlaceOrder] Error creating order:', orderError);
            return { success: false, error: 'Failed to create order' };
        }

        createdOrderIds.push(order.id);

        // Track discount redemption if applied
        if (thisOrderDiscount > 0 && discountCodeId) {
            await applyDiscountToOrder(order.id, discountCodeId, thisOrderDiscount, user.id);
            discountApplied = true;

            // Notify buyer about discount
            await createNotification(
                user.id,
                'discount',
                'notifications.discount.title',
                'notifications.discount.applied',
                { orderId: order.id, amount: thisOrderDiscount },
                `discount:${order.id}`
            );
        }

        // Notify Buyer: Order Placed
        await createNotification(
            user.id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.placed',
            { orderId: order.id, total },
            `order_status:${order.id}:placed`
        );

        // Notify Seller: New Order
        if (orderData.sellerProfileId) {
            await createNotification(
                orderData.sellerProfileId,
                'order_status',
                'notifications.orderStatus.title',
                'notifications.orderStatus.placed', // We can reuse 'placed' or add 'new_order' key. Using 'placed' for now as "New Order Placed"
                { orderId: order.id, total },
                `order_status:${order.id}:placed_seller`
            );
        }

        // Create order items and update stock
        for (const item of orderData.items) {
            const lineTotal = item.price * item.quantity;

            await supabase.from('order_items').insert({
                order_id: order.id,
                product_id: item.productId,
                title_snapshot: item.title,
                price_snapshot: item.price,
                quantity: item.quantity,
                line_total: lineTotal,
            });

            await supabase.from('products').update({ stock: item.stock - item.quantity }).eq('id', item.productId);
        }

        // Create delivery record
        await supabase.from('deliveries').insert({ order_id: order.id, status: 'available' });
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('profile_id', user.id);

    return { success: true, data: { orderId: createdOrderIds[0] } };
}

// Cancel Order (Buyer - only if status is 'placed')
export async function buyerCancelOrder(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        orderId: formData.get('orderId') as string,
        reason: formData.get('reason') as string || undefined,
    };

    const validation = cancelOrderSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { orderId, reason } = validation.data;

    const { data: order } = await supabase
        .from('orders')
        .select('id, status, buyer_profile_id, sellers(profile_id)')
        .eq('id', orderId)
        .maybeSingle();

    if (!order) return { success: false, error: 'Order not found' };
    if (order.buyer_profile_id !== user.id) return { success: false, error: 'Unauthorized' };
    if (order.status !== 'placed') return { success: false, error: 'Order cannot be cancelled at this stage' };

    await supabase.from('orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason }).eq('id', orderId);

    // Notify Seller
    const seller = order.sellers as any;
    if (seller?.profile_id) {
        await createNotification(
            seller.profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.cancelled', // Need to add this key
            { orderId: orderId, reason },
            `order_status:${orderId}:cancelled`
        );
    }

    // Restore product stock
    const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', orderId);

    if (orderItems) {
        for (const item of orderItems) {
            if (item.product_id) {
                const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).maybeSingle();
                if (product) {
                    await supabase.from('products').update({ stock: product.stock + item.quantity }).eq('id', item.product_id);
                }
            }
        }
    }

    return { success: true };
}

// Seller Accept Order
export async function sellerAcceptOrder(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const orderId = formData.get('orderId') as string;
    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', user.id).maybeSingle();
    if (!seller) return { success: false, error: 'Not a seller' };

    const { data: order } = await supabase.from('orders').select('id, status, seller_id, buyer_profile_id').eq('id', orderId).maybeSingle();
    if (!order || order.seller_id !== seller.id) return { success: false, error: 'Order not found' };
    if (order.status !== 'placed') return { success: false, error: 'Cannot accept order in current status' };

    await supabase.from('orders').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', orderId);

    // Notify Buyer
    if (order.buyer_profile_id) {
        await createNotification(
            order.buyer_profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.accepted',
            { orderId },
            `order_status:${orderId}:accepted`
        );
    }

    return { success: true };
}

// Seller Mark Preparing
export async function sellerMarkPreparing(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const orderId = formData.get('orderId') as string;
    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', user.id).maybeSingle();
    if (!seller) return { success: false, error: 'Not a seller' };

    const { data: order } = await supabase.from('orders').select('id, status, seller_id, buyer_profile_id').eq('id', orderId).maybeSingle();
    if (!order || order.seller_id !== seller.id) return { success: false, error: 'Order not found' };
    if (order.status !== 'accepted') return { success: false, error: 'Cannot mark as preparing in current status' };

    await supabase.from('orders').update({ status: 'preparing', preparing_at: new Date().toISOString() }).eq('id', orderId);

    // Notify Buyer
    if (order.buyer_profile_id) {
        await createNotification(
            order.buyer_profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.preparing',
            { orderId },
            `order_status:${orderId}:preparing`
        );
    }

    return { success: true };
}

// Seller Mark Ready for Pickup
export async function sellerMarkReadyForPickup(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const orderId = formData.get('orderId') as string;
    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', user.id).maybeSingle();
    if (!seller) return { success: false, error: 'Not a seller' };

    const { data: order } = await supabase.from('orders').select('id, status, seller_id, buyer_profile_id').eq('id', orderId).maybeSingle();
    if (!order || order.seller_id !== seller.id) return { success: false, error: 'Order not found' };
    if (order.status !== 'preparing') return { success: false, error: 'Cannot mark as ready in current status' };

    await supabase.from('orders').update({ status: 'ready_for_pickup', ready_at: new Date().toISOString() }).eq('id', orderId);

    // Notify Buyer
    if (order.buyer_profile_id) {
        await createNotification(
            order.buyer_profile_id,
            'order_status',
            'notifications.orderStatus.title',
            'notifications.orderStatus.ready_for_pickup',
            { orderId },
            `order_status:${orderId}:ready_for_pickup`
        );
    }

    return { success: true };
}
