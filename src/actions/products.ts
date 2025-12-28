'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

const createProductSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    priceJod: z.number().positive(),
    stock: z.number().int().min(0),
    category: z.string().optional(),
});

export async function sellerCreateProduct(formData: FormData): Promise<ActionResult<{ productId: string }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: seller } = await supabase.from('sellers').select('id, status').eq('profile_id', user.id).maybeSingle();
    if (!seller || seller.status !== 'approved') return { success: false, error: 'Not an approved seller' };

    const rawData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        priceJod: parseFloat(formData.get('priceJod') as string),
        stock: parseInt(formData.get('stock') as string || '0', 10),
        category: formData.get('category') as string || undefined,
    };

    const validation = createProductSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: validation.error.errors[0].message };

    const { title, description, priceJod, stock, category } = validation.data;
    const imagesStr = formData.get('images') as string || '';
    const images = imagesStr ? imagesStr.split(',').filter(Boolean) : [];

    const { data: product, error } = await supabase.from('products').insert({
        seller_id: seller.id, title, description, price_jod: priceJod, stock, category, is_active: true, images,
    }).select('id').single();

    if (error || !product) return { success: false, error: error?.message || 'Failed' };
    return { success: true, data: { productId: product.id } };
}

export async function sellerUpdateProduct(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', user.id).maybeSingle();
    if (!seller) return { success: false, error: 'Not a seller' };

    const productId = formData.get('productId') as string;
    const { data: existing } = await supabase.from('products').select('id, seller_id').eq('id', productId).maybeSingle();
    if (!existing || existing.seller_id !== seller.id) return { success: false, error: 'Product not found' };

    const updateData: Record<string, unknown> = {};
    if (formData.get('title')) updateData.title = formData.get('title');
    if (formData.get('description')) updateData.description = formData.get('description');
    if (formData.get('priceJod')) updateData.price_jod = parseFloat(formData.get('priceJod') as string);
    if (formData.get('stock')) updateData.stock = parseInt(formData.get('stock') as string, 10);
    if (formData.get('category')) updateData.category = formData.get('category');
    if (formData.has('isActive')) updateData.is_active = formData.get('isActive') === 'true';

    const { error } = await supabase.from('products').update(updateData).eq('id', productId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function sellerDeleteProduct(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: seller } = await supabase.from('sellers').select('id').eq('profile_id', user.id).maybeSingle();
    if (!seller) return { success: false, error: 'Not a seller' };

    const productId = formData.get('productId') as string;
    const { data: existing } = await supabase.from('products').select('id, seller_id').eq('id', productId).maybeSingle();
    if (!existing || existing.seller_id !== seller.id) return { success: false, error: 'Product not found' };

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}
