'use server';

import {
    createClient as createUserClient,
    createAdminClient,
    getProfile
} from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { createNotification } from './notifications';

type Badge = Database['public']['Tables']['badges']['Row'];
type ProfileBadge = Database['public']['Tables']['profile_badges']['Row'];

// =====================================================
// PUBLIC: GET PROFILE BADGES
// =====================================================

export interface ProfileBadgeWithDetails {
    id: string;
    badgeKey: string;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    icon: string;
    awardedAt: string;
    awardedReason: string | null;
}

export async function getProfileBadges(profileId: string): Promise<{
    success: boolean;
    data?: ProfileBadgeWithDetails[];
    error?: string;
}> {
    const supabase = await createUserClient();

    const { data, error } = await supabase
        .from('profile_badges')
        .select(`
            id,
            awarded_at,
            awarded_reason,
            badges!inner(key, title_en, title_ar, description_en, description_ar, icon, is_active)
        `)
        .eq('profile_id', profileId);

    if (error) {
        console.error('[getProfileBadges] Error:', error);
        return { success: false, error: error.message };
    }

    const badges: ProfileBadgeWithDetails[] = (data || [])
        .filter(pb => {
            const badge = pb.badges as unknown as { is_active: boolean };
            return badge?.is_active;
        })
        .map(pb => {
            const badge = pb.badges as unknown as Badge;
            return {
                id: pb.id,
                badgeKey: badge.key,
                titleEn: badge.title_en,
                titleAr: badge.title_ar,
                descriptionEn: badge.description_en,
                descriptionAr: badge.description_ar,
                icon: badge.icon,
                awardedAt: pb.awarded_at,
                awardedReason: pb.awarded_reason,
            };
        });

    return { success: true, data: badges };
}

// =====================================================
// BADGE EVALUATION: BUYER BADGES
// =====================================================

export async function evaluateBuyerBadges(profileId: string): Promise<{
    success: boolean;
    awarded?: string[];
    error?: string;
}> {
    const supabase = await createUserClient();
    const awarded: string[] = [];

    // Get buyer stats
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('buyer_profile_id', profileId);

    const completedOrders = (orders || []).filter(o =>
        o.status === 'delivered' || o.status === 'completed'
    ).length;

    // Get disputes count
    const { count: disputeCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('submitter_id', profileId);

    // Get existing badges for this profile
    const { data: existingBadges } = await supabase
        .from('profile_badges')
        .select('badge_id, badges!inner(key)')
        .eq('profile_id', profileId);

    const existingKeys = new Set(
        (existingBadges || []).map(pb => (pb.badges as unknown as { key: string }).key)
    );

    // Badge: trusted_buyer - 5+ completed orders, 0 disputes
    if (completedOrders >= 5 && (disputeCount || 0) === 0 && !existingKeys.has('trusted_buyer')) {
        const badgeAwarded = await awardBadge(profileId, 'trusted_buyer', 'Completed 5+ orders with no disputes');
        if (badgeAwarded) awarded.push('trusted_buyer');
    }

    // Badge: loyal_customer - 10+ completed orders
    if (completedOrders >= 10 && !existingKeys.has('loyal_customer')) {
        const badgeAwarded = await awardBadge(profileId, 'loyal_customer', 'Completed 10+ orders');
        if (badgeAwarded) awarded.push('loyal_customer');
    }

    return { success: true, awarded };
}

// =====================================================
// BADGE EVALUATION: SELLER BADGES
// =====================================================

export async function evaluateSellerBadges(sellerId: string): Promise<{
    success: boolean;
    awarded?: string[];
    error?: string;
}> {
    const supabase = await createUserClient();
    const awarded: string[] = [];

    // Get seller profile_id
    const { data: seller } = await supabase
        .from('sellers')
        .select('profile_id')
        .eq('id', sellerId)
        .maybeSingle();

    if (!seller) {
        return { success: false, error: 'Seller not found' };
    }

    const profileId = seller.profile_id;

    // Get seller orders stats
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('seller_id', sellerId);

    const completedOrders = (orders || []).filter(o =>
        o.status === 'delivered' || o.status === 'completed'
    ).length;

    // Get average rating (from reviews)
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', sellerId);

    const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Get existing badges
    const { data: existingBadges } = await supabase
        .from('profile_badges')
        .select('badge_id, badges!inner(key)')
        .eq('profile_id', profileId);

    const existingKeys = new Set(
        (existingBadges || []).map(pb => (pb.badges as unknown as { key: string }).key)
    );

    // Badge: rising_star - 5+ orders with 3.5+ rating
    if (completedOrders >= 5 && avgRating >= 3.5 && !existingKeys.has('rising_star')) {
        const badgeAwarded = await awardBadge(profileId, 'rising_star', `${completedOrders} orders, ${avgRating.toFixed(1)} rating`);
        if (badgeAwarded) awarded.push('rising_star');
    }

    // Badge: top_seller - 20+ orders with 4.5+ rating
    if (completedOrders >= 20 && avgRating >= 4.5 && !existingKeys.has('top_seller')) {
        const badgeAwarded = await awardBadge(profileId, 'top_seller', `${completedOrders} orders, ${avgRating.toFixed(1)} rating`);
        if (badgeAwarded) awarded.push('top_seller');
    }

    return { success: true, awarded };
}

// =====================================================
// BADGE EVALUATION: DRIVER BADGES
// =====================================================

export async function evaluateDriverBadges(driverProfileId: string): Promise<{
    success: boolean;
    awarded?: string[];
    error?: string;
}> {
    const supabase = await createUserClient();
    const awarded: string[] = [];

    // Get driver deliveries
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select('id, status, picked_up_at, delivered_at')
        .eq('driver_profile_id', driverProfileId)
        .eq('status', 'delivered');

    const completedDeliveries = deliveries?.length || 0;

    // Calculate average delivery time
    const deliveryTimes: number[] = [];
    for (const d of deliveries || []) {
        if (d.picked_up_at && d.delivered_at) {
            const pickupTime = new Date(d.picked_up_at).getTime();
            const deliveredTime = new Date(d.delivered_at).getTime();
            const minutes = (deliveredTime - pickupTime) / 1000 / 60;
            if (minutes > 0 && minutes < 120) { // Sanity check
                deliveryTimes.push(minutes);
            }
        }
    }

    const avgDeliveryTime = deliveryTimes.length > 0
        ? deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length
        : 999;

    // Get existing badges
    const { data: existingBadges } = await supabase
        .from('profile_badges')
        .select('badge_id, badges!inner(key)')
        .eq('profile_id', driverProfileId);

    const existingKeys = new Set(
        (existingBadges || []).map(pb => (pb.badges as unknown as { key: string }).key)
    );

    // Badge: fast_driver - avg delivery time under 30 minutes
    if (deliveryTimes.length >= 5 && avgDeliveryTime <= 30 && !existingKeys.has('fast_driver')) {
        const badgeAwarded = await awardBadge(driverProfileId, 'fast_driver', `Average ${avgDeliveryTime.toFixed(0)} min delivery`);
        if (badgeAwarded) awarded.push('fast_driver');
    }

    // Badge: reliable_driver - 20+ deliveries with no issues
    if (completedDeliveries >= 20 && !existingKeys.has('reliable_driver')) {
        const badgeAwarded = await awardBadge(driverProfileId, 'reliable_driver', `${completedDeliveries} deliveries completed`);
        if (badgeAwarded) awarded.push('reliable_driver');
    }

    return { success: true, awarded };
}

// =====================================================
// HELPER: AWARD BADGE
// =====================================================

async function awardBadge(profileId: string, badgeKey: string, reason: string): Promise<boolean> {
    // Use Admin Client to bypass RLS for awarding badges (often cross-user trigger)
    const supabase = await createAdminClient();

    // Get badge ID
    const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('key', badgeKey)
        .eq('is_active', true)
        .maybeSingle();

    if (!badge) {
        console.error(`[awardBadge] Badge not found or inactive: ${badgeKey}`);
        return false;
    }

    // Insert badge (will fail silently if duplicate due to unique constraint)
    const { error } = await supabase
        .from('profile_badges')
        .insert({
            profile_id: profileId,
            badge_id: badge.id,
            awarded_reason: reason,
        });

    if (error) {
        // Duplicate is expected, not an error
        if (error.code === '23505') {
            return false;
        }
        console.error(`[awardBadge] Error awarding ${badgeKey}:`, error);
        return false;
    }

    console.log(`[awardBadge] Awarded ${badgeKey} to ${profileId}`);

    // Notify user
    await createNotification(
        profileId,
        'badge',
        'notifications.badge.title',
        'notifications.badge.awarded',
        { badgeKey },
        `badge:${profileId}:${badgeKey}`
    );

    return true;
}

// =====================================================
// ADMIN: GET ALL BADGES
// =====================================================

export async function getAllBadges(): Promise<{
    success: boolean;
    data?: Badge[];
    error?: string;
}> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createUserClient();
    const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('applies_to')
        .order('created_at');

    if (error) {
        console.error('[getAllBadges] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
}

// =====================================================
// ADMIN: ENABLE/DISABLE BADGE
// =====================================================

export async function enableBadge(id: string): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createUserClient();
    const { error } = await supabase
        .from('badges')
        .update({ is_active: true })
        .eq('id', id);

    if (error) {
        console.error('[enableBadge] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function disableBadge(id: string): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createUserClient();
    const { error } = await supabase
        .from('badges')
        .update({ is_active: false })
        .eq('id', id);

    if (error) {
        console.error('[disableBadge] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
