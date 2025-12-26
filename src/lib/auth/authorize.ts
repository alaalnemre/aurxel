import { getProfile } from './get-profile';
import type { UserRole, AuthorizationResult } from '@/lib/types/database';

export type DashboardType = 'buyer' | 'seller' | 'driver' | 'admin';

interface AuthorizeOptions {
    requiredRole: DashboardType;
    locale: string;
}

/**
 * Authorize access to a protected dashboard based on role ONLY.
 * NO checks for: profile_completed, is_verified, approved, accepted_join_terms
 * Simply matches role and redirects to correct dashboard if mismatch.
 */
export async function authorize({
    requiredRole,
    locale,
}: AuthorizeOptions): Promise<AuthorizationResult> {
    const { user, profile, sellerProfile, driverProfile, error } =
        await getProfile();

    // Not authenticated
    if (!user || error === 'Not authenticated') {
        return {
            authorized: false,
            redirectTo: `/${locale}/login`,
            reason: 'Not authenticated',
        };
    }

    // Profile was created (or already exists) - proceed with role check
    // If profile is still null after auto-create attempt, allow access anyway
    // This prevents redirect loops
    if (!profile) {
        // Still allow access - page will handle missing profile gracefully
        return {
            authorized: true,
            user,
            profile: undefined,
            sellerProfile: undefined,
            driverProfile: undefined,
        };
    }

    const userRole = profile.role as UserRole;

    // Admin can access everything
    if (userRole === 'admin') {
        return {
            authorized: true,
            user,
            profile,
            sellerProfile,
            driverProfile,
        };
    }

    // Simple role matching - NO approval/status checks
    switch (requiredRole) {
        case 'buyer':
            if (userRole === 'buyer') {
                return {
                    authorized: true,
                    user,
                    profile,
                };
            }
            // Redirect other roles to their dashboard
            return {
                authorized: false,
                redirectTo: `/${locale}/${userRole}`,
                reason: `Your role is ${userRole}`,
            };

        case 'seller':
            if (userRole === 'seller') {
                // ALLOW ACCESS regardless of seller_profile status
                // Page will show appropriate UI for pending/rejected
                return {
                    authorized: true,
                    user,
                    profile,
                    sellerProfile,
                };
            }
            // Redirect non-sellers to their dashboard
            return {
                authorized: false,
                redirectTo: `/${locale}/${userRole}`,
                reason: `Your role is ${userRole}`,
            };

        case 'driver':
            if (userRole === 'driver') {
                // ALLOW ACCESS regardless of driver_profile status
                // Page will show appropriate UI for pending/rejected
                return {
                    authorized: true,
                    user,
                    profile,
                    driverProfile,
                };
            }
            // Redirect non-drivers to their dashboard
            return {
                authorized: false,
                redirectTo: `/${locale}/${userRole}`,
                reason: `Your role is ${userRole}`,
            };

        case 'admin':
            // Only admins can access admin routes (handled above)
            return {
                authorized: false,
                redirectTo: `/${locale}/${userRole}`,
                reason: 'Admin access required',
            };

        default:
            // Unknown role - redirect to buyer (default)
            return {
                authorized: false,
                redirectTo: `/${locale}/buyer`,
                reason: 'Unknown dashboard',
            };
    }
}
