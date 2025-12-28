"use server";

import { createUserClient, getUser } from "@/lib/supabase/server";
import type { Product, ProductVariant, Seller } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ProductWithSeller extends Product {
    seller: Pick<Seller, "id" | "business_name" | "rating_average">;
    variants?: ProductVariant[];
}

export async function getProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: "newest" | "price_low" | "price_high" | "rating" | "popular";
    sellerId?: string;
}): Promise<ActionResult<{ products: ProductWithSeller[]; total: number }>> {
    try {
        const supabase = await createUserClient();
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from("products")
            .select(
                `
        *,
        seller:sellers!inner(id, business_name, rating_average)
      `,
                { count: "exact" }
            )
            .eq("is_active", true);

        // Apply filters
        if (options?.category) {
            query = query.eq("category", options.category);
        }

        if (options?.sellerId) {
            query = query.eq("seller_id", options.sellerId);
        }

        if (options?.search) {
            query = query.or(
                `name.ilike.%${options.search}%,name_ar.ilike.%${options.search}%,description.ilike.%${options.search}%`
            );
        }

        // Apply sorting
        switch (options?.sortBy) {
            case "price_low":
                query = query.order("base_price", { ascending: true });
                break;
            case "price_high":
                query = query.order("base_price", { ascending: false });
                break;
            case "rating":
                query = query.order("rating_average", { ascending: false });
                break;
            case "popular":
                query = query.order("total_sold", { ascending: false });
                break;
            case "newest":
            default:
                query = query.order("created_at", { ascending: false });
        }

        const { data: products, error, count } = await query.range(
            offset,
            offset + limit - 1
        );

        if (error) {
            console.error("[getProducts] Error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                products: products as ProductWithSeller[],
                total: count || 0,
            },
        };
    } catch (error) {
        console.error("[getProducts] Exception:", error);
        return { success: false, error: "Failed to get products" };
    }
}

export async function getProductById(
    productId: string
): Promise<ActionResult<ProductWithSeller>> {
    try {
        const supabase = await createUserClient();

        const { data: product, error } = await supabase
            .from("products")
            .select(
                `
        *,
        seller:sellers!inner(id, business_name, rating_average, business_description),
        variants:product_variants(*)
      `
            )
            .eq("id", productId)
            .eq("is_active", true)
            .maybeSingle();

        if (error) {
            console.error("[getProductById] Error:", error);
            return { success: false, error: error.message };
        }

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        return { success: true, data: product as ProductWithSeller };
    } catch (error) {
        console.error("[getProductById] Exception:", error);
        return { success: false, error: "Failed to get product" };
    }
}

export async function getSellerProducts(): Promise<
    ActionResult<{ products: Product[]; total: number }>
> {
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

        const { data: products, error, count } = await supabase
            .from("products")
            .select("*", { count: "exact" })
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getSellerProducts] Error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                products: products as Product[],
                total: count || 0,
            },
        };
    } catch (error) {
        console.error("[getSellerProducts] Exception:", error);
        return { success: false, error: "Failed to get seller products" };
    }
}

export async function createProduct(data: {
    name: string;
    name_ar: string;
    description?: string;
    description_ar?: string;
    category: string;
    base_price: number;
    stock_quantity: number;
    images?: string[];
}): Promise<ActionResult<Product>> {
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

        // Verify seller is verified
        const { data: profile } = await supabase
            .from("profiles")
            .select("seller_verified")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.seller_verified) {
            return { success: false, error: "Seller not verified" };
        }

        const { data: product, error } = await supabase
            .from("products")
            .insert({
                seller_id: seller.id,
                name: data.name,
                name_ar: data.name_ar,
                description: data.description || null,
                description_ar: data.description_ar || null,
                category: data.category,
                base_price: data.base_price,
                stock_quantity: data.stock_quantity,
                images: data.images || [],
                is_active: true,
            })
            .select()
            .maybeSingle();

        if (error) {
            console.error("[createProduct] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: product as Product };
    } catch (error) {
        console.error("[createProduct] Exception:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(
    productId: string,
    data: {
        name?: string;
        name_ar?: string;
        description?: string;
        description_ar?: string;
        category?: string;
        base_price?: number;
        stock_quantity?: number;
        images?: string[];
        is_active?: boolean;
    }
): Promise<ActionResult<Product>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Verify ownership
        const { data: existingProduct } = await supabase
            .from("products")
            .select("seller_id, sellers!inner(profile_id)")
            .eq("id", productId)
            .maybeSingle();

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        // TypeScript workaround for joined data
        const sellerProfileId = ((existingProduct as unknown as { sellers: { profile_id: string } }).sellers).profile_id;
        if (sellerProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: product, error } = await supabase
            .from("products")
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq("id", productId)
            .select()
            .maybeSingle();

        if (error) {
            console.error("[updateProduct] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: product as Product };
    } catch (error) {
        console.error("[updateProduct] Exception:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Verify ownership
        const { data: existingProduct } = await supabase
            .from("products")
            .select("seller_id, sellers!inner(profile_id)")
            .eq("id", productId)
            .maybeSingle();

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        const sellerProfileId = ((existingProduct as unknown as { sellers: { profile_id: string } }).sellers).profile_id;
        if (sellerProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Soft delete by marking inactive
        const { error } = await supabase
            .from("products")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", productId);

        if (error) {
            console.error("[deleteProduct] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[deleteProduct] Exception:", error);
        return { success: false, error: "Failed to delete product" };
    }
}

export async function createProductVariant(
    productId: string,
    data: {
        name: string;
        name_ar: string;
        sku?: string;
        price_adjustment: number;
        stock_quantity: number;
        attributes?: Record<string, string>;
    }
): Promise<ActionResult<ProductVariant>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Verify ownership
        const { data: existingProduct } = await supabase
            .from("products")
            .select("seller_id, sellers!inner(profile_id)")
            .eq("id", productId)
            .maybeSingle();

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        const sellerProfileId = ((existingProduct as unknown as { sellers: { profile_id: string } }).sellers).profile_id;
        if (sellerProfileId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: variant, error } = await supabase
            .from("product_variants")
            .insert({
                product_id: productId,
                name: data.name,
                name_ar: data.name_ar,
                sku: data.sku || null,
                price_adjustment: data.price_adjustment,
                stock_quantity: data.stock_quantity,
                attributes: data.attributes || {},
                is_active: true,
            })
            .select()
            .maybeSingle();

        if (error) {
            console.error("[createProductVariant] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: variant as ProductVariant };
    } catch (error) {
        console.error("[createProductVariant] Exception:", error);
        return { success: false, error: "Failed to create variant" };
    }
}

export async function getCategories(): Promise<ActionResult<string[]>> {
    try {
        const supabase = await createUserClient();

        const { data, error } = await supabase
            .from("products")
            .select("category")
            .eq("is_active", true);

        if (error) {
            console.error("[getCategories] Error:", error);
            return { success: false, error: error.message };
        }

        const categories = [...new Set(data?.map((p) => p.category) || [])];

        return { success: true, data: categories };
    } catch (error) {
        console.error("[getCategories] Exception:", error);
        return { success: false, error: "Failed to get categories" };
    }
}
