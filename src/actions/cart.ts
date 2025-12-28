'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

// Validation Schemas
const addToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
});

const updateCartSchema = z.object({
    cartItemId: z.string().uuid('Invalid cart item ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
});

const removeFromCartSchema = z.object({
    cartItemId: z.string().uuid('Invalid cart item ID'),
});

// Add to Cart
export async function buyerAddToCart(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        productId: formData.get('productId') as string,
        quantity: parseInt(formData.get('quantity') as string || '1', 10),
    };

    const validation = addToCartSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { productId, quantity } = validation.data;

    // Check product exists and is in stock
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock, is_active')
        .eq('id', productId)
        .maybeSingle();

    if (productError || !product) {
        return { success: false, error: 'Product not found' };
    }

    if (!product.is_active) {
        return { success: false, error: 'Product is not available' };
    }

    if (product.stock < quantity) {
        return { success: false, error: 'Not enough stock' };
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('profile_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

    if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            return { success: false, error: 'Not enough stock' };
        }

        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);

        if (error) {
            console.error('[buyerAddToCart] Error updating cart:', error);
            return { success: false, error: error.message };
        }
    } else {
        // Insert new item
        const { error } = await supabase
            .from('cart_items')
            .insert({
                profile_id: user.id,
                product_id: productId,
                quantity,
            });

        if (error) {
            console.error('[buyerAddToCart] Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    return { success: true };
}

// Update Cart Item
export async function buyerUpdateCart(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        cartItemId: formData.get('cartItemId') as string,
        quantity: parseInt(formData.get('quantity') as string, 10),
    };

    const validation = updateCartSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { cartItemId, quantity } = validation.data;

    // Get cart item
    const { data: cartItem, error: cartError } = await supabase
        .from('cart_items')
        .select('id, product_id')
        .eq('id', cartItemId)
        .eq('profile_id', user.id)
        .maybeSingle();

    if (cartError || !cartItem) {
        return { success: false, error: 'Cart item not found' };
    }

    // Get product stock
    const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', cartItem.product_id)
        .maybeSingle();

    const productStock = product?.stock || 0;

    if (quantity > productStock) {
        return { success: false, error: 'Not enough stock' };
    }

    const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

    if (error) {
        console.error('[buyerUpdateCart] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Remove from Cart
export async function buyerRemoveCart(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
        cartItemId: formData.get('cartItemId') as string,
    };

    const validation = removeFromCartSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    const { cartItemId } = validation.data;

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('profile_id', user.id);

    if (error) {
        console.error('[buyerRemoveCart] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Clear Cart (internal helper)
export async function clearCart(userId: string): Promise<void> {
    const supabase = await createClient();

    await supabase
        .from('cart_items')
        .delete()
        .eq('profile_id', userId);
}
