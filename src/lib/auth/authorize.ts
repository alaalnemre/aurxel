import { getProfile } from './get-profile';
import type { UserRole, AuthorizationResult } from '@/lib/types/database';

export type DashboardType = 'buyer' | 'seller' | 'driver' | 'admin';

interface AuthorizeOptions {
    requiredRole: DashboardType;
    locale: string;
}

/**
 * Authorize access to a protected dashboard based on database role and status.
 * Returns authorization result with redirect path if not authorized.
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

    // Profile not found (shouldn't happen, but handle gracefully)
    if (!profile) {
        return {
            authorized: false,
            redirectTo: `/${locale}/login`,
            reason: 'Profile not found',
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

    // Check role-specific access
    switch (requiredRole) {
        case 'buyer':
            // Buyers can access buyer dashboard
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
                reason: `Access denied. Your role is ${userRole}`,
            };

        case 'seller':
            // Must have seller role
            if (userRole !== 'seller') {
                // If buyer, redirect to seller onboarding
                if (userRole === 'buyer') {
                    return {
                        authorized: false,
                        redirectTo: `/${locale}/seller/onboarding`,
                        reason: 'Complete seller registration first',
                    };
                }
                return {
                    authorized: false,
                    redirectTo: `/${locale}/${userRole}`,
                    reason: `Access denied. Your role is ${userRole}`,
                };
            }

            // Must have approved seller profile
            if (!sellerProfile) {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/seller/onboarding`,
                    reason: 'Complete seller registration first',
                };
            }

            if (sellerProfile.status === 'pending') {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/seller/pending`,
                    reason: 'Awaiting approval',
                };
            }

            if (sellerProfile.status === 'rejected') {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/seller/rejected`,
                    reason: 'Application rejected',
                };
            }

            // Approved seller
            return {
                authorized: true,
                user,
                profile,
                sellerProfile,
            };

        case 'driver':
            // Must have driver role
            if (userRole !== 'driver') {
                // If buyer, redirect to driver onboarding
                if (userRole === 'buyer') {
                    return {
                        authorized: false,
                        redirectTo: `/${locale}/driver/onboarding`,
                        reason: 'Complete driver registration first',
                    };
                }
                return {
                    authorized: false,
                    redirectTo: `/${locale}/${userRole}`,
                    reason: `Access denied. Your role is ${userRole}`,
                };
            }

            // Must have approved driver profile
            if (!driverProfile) {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/driver/onboarding`,
                    reason: 'Complete driver registration first',
                };
            }

            if (driverProfile.status === 'pending') {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/driver/pending`,
                    reason: 'Awaiting approval',
                };
            }

            if (driverProfile.status === 'rejected') {
                return {
                    authorized: false,
                    redirectTo: `/${locale}/driver/rejected`,
                    reason: 'Application rejected',
                };
            }

            // Approved driver
            return {
                authorized: true,
                user,
                profile,
                driverProfile,
            };

        case 'admin':
            // Admin users already returned above with authorized: true
            // Non-admin users reaching here should be redirected
            return {
                authorized: false,
                redirectTo: `/${locale}/${userRole}`,
                reason: 'Admin access required',
            };

        default:
            return {
                authorized: false,
                redirectTo: `/${locale}/login`,
                reason: 'Unknown dashboard type',
            };
    }
}
