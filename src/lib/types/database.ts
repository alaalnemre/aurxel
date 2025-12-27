// src/lib/types/database.ts
// TypeScript types matching the Supabase database schema

// ============================================
// ENUMS
// ============================================

export type SellerStatus = 'pending' | 'approved' | 'rejected';
export type DriverStatus = 'pending' | 'approved' | 'rejected';

// ============================================
// TABLE TYPES
// ============================================

/**
 * Profile - Every user has one profile
 * Capabilities are flags, not exclusive roles
 */
export interface Profile {
    id: string; // UUID, same as auth.users.id
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;

    // Capability flags
    is_buyer: boolean;
    is_seller: boolean;
    is_driver: boolean;
    is_admin: boolean;

    // Timestamps
    created_at: string;
    updated_at: string;
}

/**
 * Seller Profile - Created when user becomes a seller
 */
export interface SellerProfile {
    id: string; // UUID
    user_id: string; // FK to profiles.id
    store_name: string;
    store_description: string | null;
    store_logo_url: string | null;
    business_address: string | null;
    status: SellerStatus;
    created_at: string;
    updated_at: string;
}

/**
 * Driver Profile - Created when user becomes a driver
 */
export interface DriverProfile {
    id: string; // UUID
    user_id: string; // FK to profiles.id
    vehicle_type: string | null;
    license_number: string | null;
    status: DriverStatus;
    current_lat: number | null;
    current_lng: number | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================
// INSERT/UPDATE TYPES
// ============================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type SellerProfileInsert = Omit<SellerProfile, 'id' | 'created_at' | 'updated_at' | 'status'> & {
    status?: SellerStatus;
};
export type SellerProfileUpdate = Partial<Omit<SellerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type DriverProfileInsert = Omit<DriverProfile, 'id' | 'created_at' | 'updated_at' | 'status' | 'is_available'> & {
    status?: DriverStatus;
    is_available?: boolean;
};
export type DriverProfileUpdate = Partial<Omit<DriverProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * User with all their capability profiles
 */
export interface UserWithCapabilities {
    profile: Profile;
    sellerProfile: SellerProfile | null;
    driverProfile: DriverProfile | null;
}

/**
 * Determine the primary dashboard for a user
 */
export function getPrimaryDashboard(profile: Profile): '/admin' | '/seller' | '/driver' | '/buyer' {
    if (profile.is_admin) return '/admin';
    if (profile.is_seller) return '/seller';
    if (profile.is_driver) return '/driver';
    return '/buyer';
}
