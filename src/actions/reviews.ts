'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { evaluateSellerBadges } from './badges';

export type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const createReviewSchema = z.object({
    orderId: z.string().uuid('Invalid order ID'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().optional(),
});

// Create a review for a completed order
export async function createReview(formData: FormData): Promise<ActionResult<{ reviewId: string }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const rawData = {
        orderId: formData.get('orderId') as string,
        rating: parseInt(formData.get('rating') as string),
        comment: formData.get('comment') as string || undefined,
    };

    const validation = createReviewSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    // Verify order belongs to user and is completed
    const { data: order } = await supabase
        .from('orders')
        .select('id, seller_id, status')
        .eq('id', validation.data.orderId)
        .eq('buyer_profile_id', user.id)
        .maybeSingle();

    if (!order) {
        return { success: false, error: 'Order not found' };
    }

    if (order.status !== 'completed') {
        return { success: false, error: 'Can only review completed orders' };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', validation.data.orderId)
        .maybeSingle();

    if (existingReview) {
        return { success: false, error: 'Review already exists for this order' };
    }

    // Create review
    const { data: review, error } = await supabase
        .from('reviews')
        .insert({
            order_id: validation.data.orderId,
            buyer_profile_id: user.id,
            seller_id: order.seller_id,
            rating: validation.data.rating,
            comment: validation.data.comment || null,
        })
        .select('id')
        .maybeSingle();

    if (error) {
        console.error('[createReview] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/orders');

    // Evaluate seller badges after review (rating changed or count increased)
    if (order.seller_id) {
        await evaluateSellerBadges(order.seller_id).catch(e => console.error('[createReview] Badge eval error:', e));
    }

    return { success: true, data: { reviewId: review?.id || '' } };
}

// Get reviews for a seller
export async function getSellerReviews(
    sellerId: string,
    limit: number = 20,
    offset: number = 0
): Promise<ActionResult<{
    reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        buyer: { full_name: string | null };
    }>;
    total: number;
    averageRating: number;
}>> {
    const supabase = await createClient();

    const { data: reviews, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            profiles!reviews_buyer_profile_id_fkey(full_name)
        `, { count: 'exact' })
        .eq('seller_id', sellerId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[getSellerReviews] Error:', error);
        return { success: false, error: error.message };
    }

    // Calculate average rating
    const { data: avgData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', sellerId)
        .eq('is_visible', true);

    const averageRating = avgData && avgData.length > 0
        ? avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
        : 0;

    // Transform data
    const transformedReviews = (reviews || []).map(r => {
        const profileData = r.profiles as unknown as { full_name: string | null } | null;
        return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            buyer: { full_name: profileData?.full_name || null }
        };
    });

    return {
        success: true,
        data: {
            reviews: transformedReviews,
            total: count || 0,
            averageRating: Math.round(averageRating * 10) / 10
        }
    };
}

// Get review for an order (if exists)
export async function getOrderReview(
    orderId: string
): Promise<ActionResult<{
    review: {
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
    } | null;
}>> {
    const supabase = await createClient();

    const { data: review, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .eq('order_id', orderId)
        .maybeSingle();

    if (error) {
        console.error('[getOrderReview] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: { review } };
}

// Update review (buyer only, own review)
export async function updateReview(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const reviewId = formData.get('reviewId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string || null;

    if (!reviewId || isNaN(rating) || rating < 1 || rating > 5) {
        return { success: false, error: 'Invalid input' };
    }

    const { error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', reviewId)
        .eq('buyer_profile_id', user.id);

    if (error) {
        console.error('[updateReview] Error:', error);
        return { success: false, error: error.message };
    }

    // Get seller_id for badge evaluation
    const { data: revDetails } = await supabase
        .from('reviews')
        .select('seller_id')
        .eq('id', reviewId)
        .maybeSingle();

    revalidatePath('/orders');

    if (revDetails?.seller_id) {
        await evaluateSellerBadges(revDetails.seller_id).catch(e => console.error('[updateReview] Badge eval error:', e));
    }

    return { success: true };
}
