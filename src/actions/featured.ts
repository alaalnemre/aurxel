'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { createNotification } from './notifications';

type FeaturedEntity = Database['public']['Tables']['featured_entities']['Row'];
type FeaturedEntityType = Database['public']['Enums']['featured_entity_type'];

// =====================================================
// PUBLIC: GET FEATURED STORES
// =====================================================

export interface FeaturedStoreData {
    id: string;
    sellerId: string;
    storeName: string;
    storeDescription: string | null;
    storeCity: string | null;
    logoUrl: string | null;
    titleOverride: string | null;
    subtitleOverride: string | null;
    imageOverride: string | null;
    priority: number;
}

export async function getFeaturedStores(): Promise<{
    success: boolean;
    data?: FeaturedStoreData[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('featured_entities')
        .select(`
            id,
            seller_id,
            title_override,
            subtitle_override,
            image_override,
            priority,
            sellers!inner(id, store_name, description, store_city, logo_url)
        `)
        .eq('entity_type', 'store')
        .eq('is_active', true)
        .or('starts_at.is.null,starts_at.lte.now()')
        .or('ends_at.is.null,ends_at.gte.now()')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('[getFeaturedStores] Error:', error);
        return { success: false, error: error.message };
    }

    const featuredStores: FeaturedStoreData[] = (data || []).map(item => {
        const seller = item.sellers as unknown as {
            id: string;
            store_name: string;
            description: string | null;
            store_city: string | null;
            logo_url: string | null;
        };
        return {
            id: item.id,
            sellerId: item.seller_id!,
            storeName: seller?.store_name || '',
            storeDescription: seller?.description || null,
            storeCity: seller?.store_city || null,
            logoUrl: seller?.logo_url || null,
            titleOverride: item.title_override,
            subtitleOverride: item.subtitle_override,
            imageOverride: item.image_override,
            priority: item.priority,
        };
    });

    return { success: true, data: featuredStores };
}

// =====================================================
// PUBLIC: GET FEATURED PRODUCTS
// =====================================================

export interface FeaturedProductData {
    id: string;
    productId: string;
    productTitle: string;
    productDescription: string | null;
    productPrice: number;
    productImage: string | null;
    sellerId: string;
    sellerName: string;
    titleOverride: string | null;
    subtitleOverride: string | null;
    imageOverride: string | null;
    priority: number;
}

export async function getFeaturedProducts(): Promise<{
    success: boolean;
    data?: FeaturedProductData[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('featured_entities')
        .select(`
            id,
            product_id,
            title_override,
            subtitle_override,
            image_override,
            priority,
            products!inner(id, title, description, price_jod, image_url, seller_id, is_active, sellers(store_name))
        `)
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .or('starts_at.is.null,starts_at.lte.now()')
        .or('ends_at.is.null,ends_at.gte.now()')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('[getFeaturedProducts] Error:', error);
        return { success: false, error: error.message };
    }

    const featuredProducts: FeaturedProductData[] = (data || [])
        .filter(item => {
            const product = item.products as unknown as { is_active: boolean };
            return product?.is_active;
        })
        .map(item => {
            const product = item.products as unknown as {
                id: string;
                title: string;
                description: string | null;
                price_jod: number;
                image_url: string | null;
                seller_id: string;
                sellers: { store_name: string } | null;
            };
            return {
                id: item.id,
                productId: item.product_id!,
                productTitle: product?.title || '',
                productDescription: product?.description || null,
                productPrice: product?.price_jod || 0,
                productImage: product?.image_url || null,
                sellerId: product?.seller_id || '',
                sellerName: product?.sellers?.store_name || '',
                titleOverride: item.title_override,
                subtitleOverride: item.subtitle_override,
                imageOverride: item.image_override,
                priority: item.priority,
            };
        });

    return { success: true, data: featuredProducts };
}

// =====================================================
// ADMIN: GET ALL FEATURED
// =====================================================

export async function getAdminFeatured(): Promise<{
    success: boolean;
    data?: FeaturedEntity[];
    error?: string;
}> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('featured_entities')
        .select('*')
        .order('entity_type')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAdminFeatured] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
}

// =====================================================
// ADMIN: CREATE FEATURED ENTITY
// =====================================================

export interface CreateFeaturedInput {
    entity_type: FeaturedEntityType;
    seller_id?: string;
    product_id?: string;
    title_override?: string;
    subtitle_override?: string;
    image_override?: string;
    priority?: number;
    starts_at?: string;
    ends_at?: string;
}

export async function createFeaturedEntity(
    input: CreateFeaturedInput
): Promise<{ success: boolean; data?: FeaturedEntity; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Validate based on entity_type
    if (input.entity_type === 'store' && !input.seller_id) {
        return { success: false, error: 'Seller ID is required for store feature' };
    }
    if (input.entity_type === 'product' && !input.product_id) {
        return { success: false, error: 'Product ID is required for product feature' };
    }

    const { data, error } = await supabase
        .from('featured_entities')
        .insert({
            entity_type: input.entity_type,
            seller_id: input.entity_type === 'store' ? input.seller_id : null,
            product_id: input.entity_type === 'product' ? input.product_id : null,
            title_override: input.title_override || null,
            subtitle_override: input.subtitle_override || null,
            image_override: input.image_override || null,
            priority: input.priority || 0,
            starts_at: input.starts_at || null,
            ends_at: input.ends_at || null,
            created_by: profile.id,
        })
        .select()
        .single();

    if (error) {
        console.error('[createFeaturedEntity] Error:', error);
        if (error.code === '23505') {
            return { success: false, error: 'This entity is already featured' };
        }
        return { success: false, error: error.message };
    }

    // Notify Seller
    try {
        let sellerProfileId: string | null = null;
        let entityName = '';

        if (input.entity_type === 'store' && input.seller_id) {
            const { data: seller } = await supabase.from('sellers').select('profile_id, store_name').eq('id', input.seller_id).maybeSingle();
            sellerProfileId = seller?.profile_id || null;
            entityName = seller?.store_name || '';
        } else if (input.entity_type === 'product' && input.product_id) {
            const { data: product } = await supabase
                .from('products')
                .select('title, sellers(profile_id)')
                .eq('id', input.product_id)
                .maybeSingle();

            if (product) {
                const seller = product.sellers as any;
                sellerProfileId = seller?.profile_id || null;
                entityName = product.title;
            }
        }

        if (sellerProfileId) {
            await createNotification(
                sellerProfileId,
                'featured',
                'notifications.featured.title',
                'notifications.featured.message',
                { name: entityName, type: input.entity_type },
                `featured:${data.id}`
            );
        }
    } catch (notifyError) {
        console.error('[createFeaturedEntity] Error notifying seller:', notifyError);
    }

    return { success: true, data };
}

// =====================================================
// ADMIN: UPDATE FEATURED ENTITY
// =====================================================

export interface UpdateFeaturedInput {
    title_override?: string | null;
    subtitle_override?: string | null;
    image_override?: string | null;
    priority?: number;
    starts_at?: string | null;
    ends_at?: string | null;
    is_active?: boolean;
}

export async function updateFeaturedEntity(
    id: string,
    input: UpdateFeaturedInput
): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('featured_entities')
        .update(input)
        .eq('id', id);

    if (error) {
        console.error('[updateFeaturedEntity] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =====================================================
// ADMIN: ENABLE/DISABLE FEATURED ENTITY
// =====================================================

export async function enableFeaturedEntity(id: string): Promise<{ success: boolean; error?: string }> {
    return updateFeaturedEntity(id, { is_active: true });
}

export async function disableFeaturedEntity(id: string): Promise<{ success: boolean; error?: string }> {
    return updateFeaturedEntity(id, { is_active: false });
}

// =====================================================
// ADMIN: DELETE FEATURED ENTITY
// =====================================================

export async function deleteFeaturedEntity(id: string): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('featured_entities')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[deleteFeaturedEntity] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
