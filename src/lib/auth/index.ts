import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Seller = Database['public']['Tables']['sellers']['Row'];
type Driver = Database['public']['Tables']['drivers']['Row'];

/**
 * Get the current user from the session
 */
export async function getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Get the current user's profile with role
 */
export async function getUserProfile(): Promise<Profile | null> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return null;
    }

    return profile;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
    const profile = await getUserProfile();
    return profile?.role ?? null;
}

/**
 * Check if current user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const userRole = await getUserRole();
    return userRole === role;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole('admin');
}

/**
 * Check if current user is a seller with approved KYC
 */
export async function isApprovedSeller(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: seller } = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', user.id)
        .single() as { data: Pick<Seller, 'status'> | null };

    return seller?.status === 'approved';
}

/**
 * Check if current user is a driver with approved KYC
 */
export async function isApprovedDriver(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: driver } = await supabase
        .from('drivers')
        .select('status')
        .eq('user_id', user.id)
        .single() as { data: Pick<Driver, 'status'> | null };

    return driver?.status === 'approved';
}

/**
 * Require authentication - throws redirect if not logged in
 */
export async function requireAuth(locale: string) {
    const user = await getUser();

    if (!user) {
        // Import redirect dynamically to avoid issues in edge runtime
        const { redirect } = await import('next/navigation');
        redirect(`/${locale}/login`);
    }

    return user;
}

/**
 * Require specific role - throws redirect if not authorized
 */
export async function requireRole(role: UserRole, locale: string) {
    await requireAuth(locale);
    const userRole = await getUserRole();

    if (userRole !== role) {
        const { redirect } = await import('next/navigation');
        redirect(`/${locale}/unauthorized`);
    }
}
