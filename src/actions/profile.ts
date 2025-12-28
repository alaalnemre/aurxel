"use server";

import { createUserClient, createAdminClient, getUser } from "@/lib/supabase/server";
import type { Profile, VerificationStatus } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function getProfile(): Promise<ActionResult<Profile>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.error("[getProfile] Error:", error);
            return { success: false, error: error.message };
        }

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        return { success: true, data: profile as Profile };
    } catch (error) {
        console.error("[getProfile] Exception:", error);
        return { success: false, error: "Failed to get profile" };
    }
}

export async function updateProfile(data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}): Promise<ActionResult<Profile>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();
        const { data: profile, error } = await supabase
            .from("profiles")
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("[updateProfile] Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: profile as Profile };
    } catch (error) {
        console.error("[updateProfile] Exception:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function becomeSeller(data: {
    business_name: string;
    business_description?: string;
    business_address: string;
}): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Check if already a seller
        const { data: existingSeller } = await supabase
            .from("sellers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (existingSeller) {
            return { success: false, error: "Already registered as seller" };
        }

        // Create seller record
        const { error: sellerError } = await supabase.from("sellers").insert({
            profile_id: user.id,
            business_name: data.business_name,
            business_description: data.business_description || null,
            business_address: data.business_address,
        });

        if (sellerError) {
            console.error("[becomeSeller] Seller insert error:", sellerError);
            return { success: false, error: sellerError.message };
        }

        // Update profile with seller flag and verification status
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                is_seller: true,
                seller_verification_status: "pending" as VerificationStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (profileError) {
            console.error("[becomeSeller] Profile update error:", profileError);
            return { success: false, error: profileError.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[becomeSeller] Exception:", error);
        return { success: false, error: "Failed to register as seller" };
    }
}

export async function becomeDriver(data: {
    license_number: string;
    vehicle_type: string;
    vehicle_plate: string;
}): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();

        // Check if already a driver
        const { data: existingDriver } = await supabase
            .from("drivers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (existingDriver) {
            return { success: false, error: "Already registered as driver" };
        }

        // Create driver record
        const { error: driverError } = await supabase.from("drivers").insert({
            profile_id: user.id,
            license_number: data.license_number,
            vehicle_type: data.vehicle_type,
            vehicle_plate: data.vehicle_plate,
        });

        if (driverError) {
            console.error("[becomeDriver] Driver insert error:", driverError);
            return { success: false, error: driverError.message };
        }

        // Update profile with driver flag and verification status
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                is_driver: true,
                driver_verification_status: "pending" as VerificationStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (profileError) {
            console.error("[becomeDriver] Profile update error:", profileError);
            return { success: false, error: profileError.message };
        }

        return { success: true };
    } catch (error) {
        console.error("[becomeDriver] Exception:", error);
        return { success: false, error: "Failed to register as driver" };
    }
}

// Admin-only profile actions
export async function adminVerifySeller(
    profileId: string,
    approved: boolean,
    reason?: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify admin status
        const supabase = await createUserClient();
        const { data: adminProfile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!adminProfile?.is_admin) {
            return { success: false, error: "Unauthorized" };
        }

        // Use admin client to bypass RLS
        const adminClient = await createAdminClient();

        const status: VerificationStatus = approved ? "approved" : "rejected";
        const { error } = await adminClient
            .from("profiles")
            .update({
                seller_verified: approved,
                seller_verification_status: status,
                seller_activated_at: approved ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profileId);

        if (error) {
            console.error("[adminVerifySeller] Error:", error);
            return { success: false, error: error.message };
        }

        // Log admin action
        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            action: approved ? "approve_seller" : "reject_seller",
            entity_type: "profile",
            entity_id: profileId,
            new_data: { status, reason },
        });

        return { success: true };
    } catch (error) {
        console.error("[adminVerifySeller] Exception:", error);
        return { success: false, error: "Failed to verify seller" };
    }
}

export async function adminVerifyDriver(
    profileId: string,
    approved: boolean,
    reason?: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify admin status
        const supabase = await createUserClient();
        const { data: adminProfile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!adminProfile?.is_admin) {
            return { success: false, error: "Unauthorized" };
        }

        // Use admin client to bypass RLS
        const adminClient = await createAdminClient();

        const status: VerificationStatus = approved ? "approved" : "rejected";
        const { error } = await adminClient
            .from("profiles")
            .update({
                driver_verified: approved,
                driver_verification_status: status,
                driver_activated_at: approved ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profileId);

        if (error) {
            console.error("[adminVerifyDriver] Error:", error);
            return { success: false, error: error.message };
        }

        // Log admin action
        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            action: approved ? "approve_driver" : "reject_driver",
            entity_type: "profile",
            entity_id: profileId,
            new_data: { status, reason },
        });

        return { success: true };
    } catch (error) {
        console.error("[adminVerifyDriver] Exception:", error);
        return { success: false, error: "Failed to verify driver" };
    }
}

export async function adminGetAllProfiles(options?: {
    page?: number;
    limit?: number;
    filter?: "all" | "buyers" | "sellers" | "drivers" | "pending_sellers" | "pending_drivers";
}): Promise<ActionResult<{ profiles: Profile[]; total: number }>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify admin status
        const supabase = await createUserClient();
        const { data: adminProfile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!adminProfile?.is_admin) {
            return { success: false, error: "Unauthorized" };
        }

        const adminClient = await createAdminClient();
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        let query = adminClient.from("profiles").select("*", { count: "exact" });

        // Apply filters
        if (options?.filter === "buyers") {
            query = query.eq("is_buyer", true);
        } else if (options?.filter === "sellers") {
            query = query.eq("is_seller", true);
        } else if (options?.filter === "drivers") {
            query = query.eq("is_driver", true);
        } else if (options?.filter === "pending_sellers") {
            query = query
                .eq("is_seller", true)
                .eq("seller_verification_status", "pending");
        } else if (options?.filter === "pending_drivers") {
            query = query
                .eq("is_driver", true)
                .eq("driver_verification_status", "pending");
        }

        const { data: profiles, error, count } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("[adminGetAllProfiles] Error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                profiles: profiles as Profile[],
                total: count || 0,
            },
        };
    } catch (error) {
        console.error("[adminGetAllProfiles] Exception:", error);
        return { success: false, error: "Failed to get profiles" };
    }
}
