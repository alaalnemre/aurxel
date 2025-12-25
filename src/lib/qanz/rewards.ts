'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-profile';
import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import type { QanzRewardRule, QanzRewardEventWithDetails } from '@/lib/types/database';

/**
 * Get all reward rules (admin only)
 */
export async function getRewardRules(): Promise<QanzRewardRule[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('qanz_reward_rules')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[getRewardRules] Error:', error);
        return [];
    }

    return (data || []) as QanzRewardRule[];
}

/**
 * Update reward rule amount (admin only)
 */
export async function updateRewardAmount(
    ruleId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Unauthorized' };
    }

    if (amount <= 0) {
        return { success: false, error: 'Amount must be positive' };
    }

    const { error } = await supabase
        .from('qanz_reward_rules')
        .update({ amount })
        .eq('id', ruleId);

    if (error) {
        console.error('[updateRewardAmount] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/${locale}/admin/qanz/rewards`);
    return { success: true };
}

/**
 * Toggle reward rule active status (admin only)
 */
export async function toggleRewardRule(
    ruleId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const locale = await getLocale();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('qanz_reward_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

    if (error) {
        console.error('[toggleRewardRule] Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/${locale}/admin/qanz/rewards`);
    return { success: true };
}

/**
 * Get recent reward events (admin only)
 */
export async function getRecentRewardEvents(
    limit: number = 50
): Promise<QanzRewardEventWithDetails[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('qanz_reward_events')
        .select(`
            *,
            user:profiles!user_id(id, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[getRecentRewardEvents] Error:', error);
        return [];
    }

    return (data || []) as QanzRewardEventWithDetails[];
}

/**
 * Get user's reward events
 */
export async function getUserRewardEvents(limit: number = 10): Promise<QanzRewardEventWithDetails[]> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('qanz_reward_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[getUserRewardEvents] Error:', error);
        return [];
    }

    return (data || []) as QanzRewardEventWithDetails[];
}

/**
 * Get user's total rewards this month
 */
export async function getRewardsThisMonth(): Promise<number> {
    const supabase = await createClient();
    const { user } = await getProfile();

    if (!user) {
        return 0;
    }

    // First day of current month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('qanz_reward_events')
        .select('issued_amount')
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

    if (error) {
        console.error('[getRewardsThisMonth] Error:', error);
        return 0;
    }

    return (data || []).reduce((sum, e) => sum + Number(e.issued_amount || 0), 0);
}

/**
 * Get reward stats for admin dashboard
 */
export async function getRewardStats(): Promise<{
    totalRewarded: number;
    rewardsThisMonth: number;
    activeRules: number;
    totalEvents: number;
}> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { totalRewarded: 0, rewardsThisMonth: 0, activeRules: 0, totalEvents: 0 };
    }

    // First day of current month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [allEventsResult, monthEventsResult, rulesResult] = await Promise.all([
        supabase.from('qanz_reward_events').select('issued_amount'),
        supabase
            .from('qanz_reward_events')
            .select('issued_amount')
            .gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('qanz_reward_rules').select('id, is_active'),
    ]);

    const allEvents = allEventsResult.data || [];
    const monthEvents = monthEventsResult.data || [];
    const rules = rulesResult.data || [];

    return {
        totalRewarded: allEvents.reduce((sum, e) => sum + Number(e.issued_amount || 0), 0),
        rewardsThisMonth: monthEvents.reduce((sum, e) => sum + Number(e.issued_amount || 0), 0),
        activeRules: rules.filter((r) => r.is_active).length,
        totalEvents: allEvents.length,
    };
}
