"use server";

import { createUserClient, getUser } from "@/lib/supabase/server";
import type { Cart, CartItem, Product, ProductVariant } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface CartItemWithProduct extends CartItem {
    product: Product;
    variant?: ProductVariant;
}

export interface CartWithItems extends Cart {
    items: CartItemWithProduct[];
    subtotal: number;
    itemCount: number;
}

export async function getCart(): Promise<ActionResult<CartWithItems>> {
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
        *,
        items:cart_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `
            )
            .eq("profile_id", user.id)
            .maybeSingle();

        if (cartError) {
            console.error("[getCart] Error:", cartError);
            return { success: false, error: cartError.message };
        }

        if (!cart) {
            // Create cart if doesn't exist
            const { data: newCart, error: createError } = await supabase
                .from("carts")
                .insert({ profile_id: user.id })
                .select()
                .maybeSingle();

            if (createError) {
                console.error("[getCart] Create error:", createError);
                return { success: false, error: createError.message };
            }

            return {
                success: true,
                data: {
                    ...newCart!,
                    items: [],
                    subtotal: 0,
                    itemCount: 0,
                } as CartWithItems,
            };
        }

        // Calculate subtotal
        const items = (cart.items || []) as CartItemWithProduct[];
        const subtotal = items.reduce((sum, item) => {
            const basePrice = Number(item.product?.base_price || 0);
            const adjustment = Number(item.variant?.price_adjustment || 0);
            return sum + (basePrice + adjustment) * item.quantity;
        }, 0);

        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            success: true,
            data: {
                ...cart,
                items,
                subtotal,
                itemCount,
            } as CartWithItems,
        };
    } catch (error) {
        console.error("[getCart] Exception:", error);
        return { success: false, error: "Failed to get cart" };
    }
}

export async function addToCart(
    productId: string,
    quantity: number,
    variantId?: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        if (quantity <= 0) {
            return { success: false, error: "Quantity must be positive" };
        }

        const supabase = await createUserClient();

        // Get cart
        let { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!cart) {
            const { data: newCart, error: createError } = await supabase
                .from("carts")
                .insert({ profile_id: user.id })
                .select("id")
                .maybeSingle();

            if (createError) {
                console.error("[addToCart] Create cart error:", createError);
                return { success: false, error: createError.message };
            }
            cart = newCart!;
        }

        // Get product price
        const { data: product } = await supabase
            .from("products")
            .select("base_price, stock_quantity, is_active")
            .eq("id", productId)
            .maybeSingle();

        if (!product || !product.is_active) {
            return { success: false, error: "Product not available" };
        }

        // Get variant price adjustment if applicable
        let unitPrice = Number(product.base_price);
        let availableStock = product.stock_quantity;

        if (variantId) {
            const { data: variant } = await supabase
                .from("product_variants")
                .select("price_adjustment, stock_quantity, is_active")
                .eq("id", variantId)
                .maybeSingle();

            if (!variant || !variant.is_active) {
                return { success: false, error: "Variant not available" };
            }

            unitPrice += Number(variant.price_adjustment);
            availableStock = variant.stock_quantity;
        }

        // Check stock
        if (quantity > availableStock) {
            return { success: false, error: "Insufficient stock" };
        }

        // Check if item already in cart
        const { data: existingItem } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cart.id)
            .eq("product_id", productId)
            .eq("variant_id", variantId || "")
            .maybeSingle();

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                return { success: false, error: "Insufficient stock" };
            }

            const { error } = await supabase
                .from("cart_items")
                .update({ quantity: newQuantity })
                .eq("id", existingItem.id);

            if (error) {
                console.error("[addToCart] Update error:", error);
                return { success: false, error: error.message };
            }
        } else {
            // Add new item
            const { error } = await supabase.from("cart_items").insert({
                cart_id: cart.id,
                product_id: productId,
                variant_id: variantId || null,
                quantity,
                unit_price: unitPrice,
            });

            if (error) {
                console.error("[addToCart] Insert error:", error);
                return { success: false, error: error.message };
            }
        }

        // Update cart timestamp
        await supabase
            .from("carts")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", cart.id);

        return { success: true };
    } catch (error) {
        console.error("[addToCart] Exception:", error);
        return { success: false, error: "Failed to add to cart" };
    }
}

export async function updateCartItem(
    itemId: string,
    quantity: number
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        if (quantity <= 0) {
            return removeFromCart(itemId);
        }

        const supabase = await createUserClient();

        // Verify ownership and get item details
        const { data: item } = await supabase
            .from("cart_items")
            .select(
                `
        id,
        product_id,
        variant_id,
        cart:carts!inner(profile_id),
        product:products(stock_quantity),
        variant:product_variants(stock_quantity)
      `
            )
            .eq("id", itemId)
            .maybeSingle();

        if (!item) {
            return { success: false, error: "Item not found" };
        }

        const cartProfileId = ((item as unknown as { cart: { profile_id: string } }).cart).profile_id;
        if (cartProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check stock
        const product = item.product as unknown as { stock_quantity: number } | null;
        const variant = item.variant as unknown as { stock_quantity: number } | null;
        const availableStock = variant?.stock_quantity ?? product?.stock_quantity ?? 0;

        if (quantity > availableStock) {
            return { success: false, error: "Insufficient stock" };
        }

        const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", itemId);

        if (error) {
            console.error("[updateCartItem] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[updateCartItem] Exception:", error);
        return { success: false, error: "Failed to update cart item" };
    }
}

export async function removeFromCart(itemId: string): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Verify ownership
        const { data: item } = await supabase
            .from("cart_items")
            .select("id, cart:carts!inner(profile_id)")
            .eq("id", itemId)
            .maybeSingle();

        if (!item) {
            return { success: false, error: "Item not found" };
        }

        const cartProfileId = ((item as unknown as { cart: { profile_id: string } }).cart).profile_id;
        if (cartProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

        if (error) {
            console.error("[removeFromCart] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[removeFromCart] Exception:", error);
        return { success: false, error: "Failed to remove from cart" };
    }
}

export async function clearCart(): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Get cart
        const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!cart) {
            return { success: true };
        }

        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

        if (error) {
            console.error("[clearCart] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[clearCart] Exception:", error);
        return { success: false, error: "Failed to clear cart" };
    }
}

export async function getCartItemCount(): Promise<ActionResult<number>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: true, data: 0 };
        }

        const supabase = await createUserClient();

        const { data: cart } = await supabase
            .from("carts")
            .select(
                `
        items:cart_items(quantity)
      `
            )
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!cart || !cart.items) {
            return { success: true, data: 0 };
        }

        const count = (cart.items as { quantity: number }[]).reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        return { success: true, data: count };
    } catch (error) {
        console.error("[getCartItemCount] Exception:", error);
        return { success: true, data: 0 };
    }
}
