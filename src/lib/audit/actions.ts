'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-profile';

export interface AuditLog {
    id: string;
    actor_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface AuditLogWithActor extends AuditLog {
    actor?: {
        id: string;
        full_name: string | null;
        email?: string;
    };
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>
): Promise<boolean> {
    const supabase = await createClient();
    const { user } = await getProfile();

    const { error } = await supabase.rpc('create_audit_log', {
        p_actor_id: user?.id || null,
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_metadata: metadata || {},
    });

    if (error) {
        console.error('[createAuditLog] Error:', error);
        return false;
    }

    return true;
}

/**
 * Get recent audit logs (admin only)
 */
export async function getAuditLogs(
    limit: number = 100
): Promise<AuditLogWithActor[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            actor:profiles!actor_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[getAuditLogs] Error:', error);
        return [];
    }

    return (data || []) as AuditLogWithActor[];
}

/**
 * Get audit logs by entity (admin only)
 */
export async function getAuditLogsByEntity(
    entityType: string,
    entityId: string
): Promise<AuditLogWithActor[]> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return [];
    }

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            actor:profiles!actor_id(id, full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAuditLogsByEntity] Error:', error);
        return [];
    }

    return (data || []) as AuditLogWithActor[];
}

/**
 * Get audit stats (admin only)
 */
export async function getAuditStats(): Promise<{
    totalLogs: number;
    todayLogs: number;
    topActions: { action: string; count: number }[];
}> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return { totalLogs: 0, todayLogs: 0, topActions: [] };
    }

    const today = new Date().toISOString().split('T')[0];

    const [allLogsResult, todayLogsResult] = await Promise.all([
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase
            .from('audit_logs')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00Z`),
    ]);

    return {
        totalLogs: allLogsResult.count || 0,
        todayLogs: todayLogsResult.count || 0,
        topActions: [],
    };
}
