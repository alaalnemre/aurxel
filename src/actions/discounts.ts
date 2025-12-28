'use server';

import { createClient, getProfile } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

type DiscountCode = Database['public']['Tables']['discount_codes']['Row'];
type DiscountType = Database['public']['Enums']['discount_type'];

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface DiscountValidationResult {
    valid: boolean;
    discountId?: string;
    discountAmount?: number;
    discountType?: DiscountType;
    discountValue?: number;
    reason?: string;
}

// =====================================================
// VALIDATE DISCOUNT CODE
// =====================================================

export async function validateDiscountCode(
    code: string,
    cartTotal: number,
    profileId: string
): Promise<DiscountValidationResult> {
    if (!code || !code.trim()) {
        return { valid: false, reason: 'discounts.invalidCode' };
    }

    const supabase = await createClient();
    const normalizedCode = code.trim().toUpperCase();

    // Get discount code
    const { data: discount, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', normalizedCode)
        .maybeSingle();

    if (error || !discount) {
        return { valid: false, reason: 'discounts.invalidCode' };
    }

    // Check if active
    if (!discount.is_active) {
        return { valid: false, reason: 'discounts.codeInactive' };
    }

    // Check date range
    const now = new Date();
    const startsAt = new Date(discount.starts_at);
    const endsAt = discount.ends_at ? new Date(discount.ends_at) : null;

    if (now < startsAt) {
        return { valid: false, reason: 'discounts.notYetValid' };
    }

    if (endsAt && now > endsAt) {
        return { valid: false, reason: 'discounts.expired' };
    }

    // Check max uses
    if (discount.max_uses !== null && discount.current_uses >= discount.max_uses) {
        return { valid: false, reason: 'discounts.usageLimitReached' };
    }

    // Check max uses per user
    if (discount.max_uses_per_user !== null) {
        const { count } = await supabase
            .from('discount_redemptions')
            .select('*', { count: 'exact', head: true })
            .eq('discount_id', discount.id)
            .eq('profile_id', profileId);

        if ((count || 0) >= discount.max_uses_per_user) {
            return { valid: false, reason: 'discounts.userLimitReached' };
        }
    }

    // Check minimum order amount
    if (discount.min_order_amount !== null && cartTotal < discount.min_order_amount) {
        return {
            valid: false,
            reason: 'discounts.minOrderRequired',
        };
    }

    // Calculate discount amount
    let discountAmount: number;
    if (discount.discount_type === 'percentage') {
        discountAmount = Math.round((cartTotal * discount.discount_value / 100) * 100) / 100;
    } else {
        // Fixed discount - cannot exceed cart total
        discountAmount = Math.min(discount.discount_value, cartTotal);
    }

    return {
        valid: true,
        discountId: discount.id,
        discountAmount,
        discountType: discount.discount_type,
        discountValue: discount.discount_value,
    };
}

// =====================================================
// APPLY DISCOUNT TO ORDER
// =====================================================

export async function applyDiscountToOrder(
    orderId: string,
    discountCodeId: string,
    discountAmount: number,
    profileId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
        // Insert redemption record (triggers usage count increment)
        const { error: redemptionError } = await supabase
            .from('discount_redemptions')
            .insert({
                discount_id: discountCodeId,
                order_id: orderId,
                profile_id: profileId,
                discount_value_applied: discountAmount,
            });

        if (redemptionError) {
            console.error('[applyDiscountToOrder] Redemption error:', redemptionError);
            // If duplicate constraint, discount already applied
            if (redemptionError.code === '23505') {
                return { success: false, error: 'discounts.alreadyApplied' };
            }
            return { success: false, error: 'discounts.applicationFailed' };
        }

        return { success: true };
    } catch (err) {
        console.error('[applyDiscountToOrder] Error:', err);
        return { success: false, error: 'discounts.applicationFailed' };
    }
}

// =====================================================
// ADMIN: GET ALL DISCOUNTS
// =====================================================

export async function getAdminDiscounts(): Promise<{
    success: boolean;
    data?: DiscountCode[];
    error?: string;
}> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAdminDiscounts] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
}

// =====================================================
// ADMIN: CREATE DISCOUNT CODE
// =====================================================

export interface CreateDiscountInput {
    code: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_uses?: number | null;
    max_uses_per_user?: number | null;
    min_order_amount?: number | null;
    starts_at?: string;
    ends_at?: string | null;
}

export async function createDiscountCode(
    input: CreateDiscountInput
): Promise<{ success: boolean; data?: DiscountCode; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Validate input
    if (!input.code || !input.code.trim()) {
        return { success: false, error: 'Code is required' };
    }

    if (input.discount_value <= 0) {
        return { success: false, error: 'Discount value must be positive' };
    }

    if (input.discount_type === 'percentage' && input.discount_value > 100) {
        return { success: false, error: 'Percentage cannot exceed 100' };
    }

    const { data, error } = await supabase
        .from('discount_codes')
        .insert({
            code: input.code.trim().toUpperCase(),
            description: input.description || null,
            discount_type: input.discount_type,
            discount_value: input.discount_value,
            max_uses: input.max_uses || null,
            max_uses_per_user: input.max_uses_per_user || null,
            min_order_amount: input.min_order_amount || null,
            starts_at: input.starts_at || new Date().toISOString(),
            ends_at: input.ends_at || null,
            created_by: profile.id,
        })
        .select()
        .single();

    if (error) {
        console.error('[createDiscountCode] Error:', error);
        if (error.code === '23505') {
            return { success: false, error: 'Code already exists' };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// =====================================================
// ADMIN: DISABLE DISCOUNT CODE
// =====================================================

export async function disableDiscountCode(
    discountId: string
): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: false })
        .eq('id', discountId);

    if (error) {
        console.error('[disableDiscountCode] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =====================================================
// ADMIN: ENABLE DISCOUNT CODE
// =====================================================

export async function enableDiscountCode(
    discountId: string
): Promise<{ success: boolean; error?: string }> {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: true })
        .eq('id', discountId);

    if (error) {
        console.error('[enableDiscountCode] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
