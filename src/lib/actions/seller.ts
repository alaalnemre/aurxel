'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
    error?: string;
    success?: boolean;
};

export async function updateSellerProfile(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const businessName = formData.get('business_name') as string;
    const businessAddress = formData.get('business_address') as string;
    const descriptionEn = formData.get('business_description_en') as string;
    const descriptionAr = formData.get('business_description_ar') as string;

    if (!businessName || !businessAddress) {
        return { error: 'Business name and address are required' };
    }

    const { error } = await supabase
        .from('seller_profiles')
        .update({
            business_name: businessName,
            business_address: businessAddress,
            business_description_en: descriptionEn || null,
            business_description_ar: descriptionAr || null,
        })
        .eq('id', user.id);

    if (error) {
        console.error('[updateSellerProfile]', error);
        return { error: error.message };
    }

    revalidatePath('/seller');
    return { success: true };
}

export async function getSellerProducts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return products || [];
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const nameEn = formData.get('name_en') as string;
    const nameAr = formData.get('name_ar') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const descriptionEn = formData.get('description_en') as string;
    const descriptionAr = formData.get('description_ar') as string;

    if (!nameEn || !nameAr || isNaN(price) || isNaN(stock)) {
        return { error: 'Missing required fields' };
    }

    const { error } = await supabase
        .from('products')
        .insert({
            seller_id: user.id,
            name_en: nameEn,
            name_ar: nameAr,
            price,
            stock,
            description_en: descriptionEn || null,
            description_ar: descriptionAr || null,
            is_active: true,
        });

    if (error) {
        console.error('[createProduct]', error);
        return { error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const updates: Record<string, unknown> = {};

    const fields = ['name_en', 'name_ar', 'description_en', 'description_ar'];
    fields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) updates[field] = value;
    });

    const price = formData.get('price');
    if (price) updates.price = parseFloat(price as string);

    const stock = formData.get('stock');
    if (stock) updates.stock = parseInt(stock as string);

    const isActive = formData.get('is_active');
    if (isActive !== null) updates.is_active = isActive === 'true';

    const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        console.error('[updateProduct]', error);
        return { error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}

export async function toggleProductStatus(productId: string, isActive: boolean): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)
        .eq('seller_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/seller/products');
    return { success: true };
}
