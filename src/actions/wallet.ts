"use server";

import { createUserClient, createAdminClient, getUser } from "@/lib/supabase/server";
import type { Wallet, WalletTransaction, TransactionType } from "@/types/database";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function getWallet(): Promise<ActionResult<Wallet>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();
        const { data: wallet, error } = await supabase
            .from("wallets")
            .select("*")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!wallet) {
            const { data: newWallet, error: createError } = await supabase
                .from("wallets")
                .insert({ profile_id: user.id })
                .select()
                .maybeSingle();

            if (createError) {
                return { success: false, error: createError.message };
            }
            return { success: true, data: newWallet as Wallet };
        }

        return { success: true, data: wallet as Wallet };
    } catch {
        return { success: false, error: "Failed to get wallet" };
    }
}

export async function getWalletTransactions(options?: {
    page?: number;
    limit?: number;
}): Promise<ActionResult<{ transactions: WalletTransaction[]; total: number }>> {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const supabase = await createUserClient();
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const { data: wallet } = await supabase
            .from("wallets")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (!wallet) {
            return { success: true, data: { transactions: [], total: 0 } };
        }

        const { data: transactions, error, count } = await supabase
            .from("wallet_transactions")
            .select("*", { count: "exact" })
            .eq("wallet_id", wallet.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: { transactions: transactions as WalletTransaction[], total: count || 0 },
        };
    } catch {
        return { success: false, error: "Failed to get transactions" };
    }
}

export async function adminAdjustWallet(
    targetProfileId: string,
    amount: number,
    type: "credit" | "debit",
    description: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.is_admin) return { success: false, error: "Unauthorized" };

        const adminClient = await createAdminClient();
        const { data: wallet } = await adminClient
            .from("wallets")
            .select("id, balance")
            .eq("profile_id", targetProfileId)
            .maybeSingle();

        if (!wallet) return { success: false, error: "Wallet not found" };

        const balanceBefore = Number(wallet.balance);
        const balanceAfter = type === "credit"
            ? balanceBefore + amount
            : balanceBefore - amount;

        if (balanceAfter < 0) return { success: false, error: "Insufficient balance" };

        await adminClient
            .from("wallets")
            .update({ balance: balanceAfter })
            .eq("id", wallet.id);

        await adminClient.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            type: type as TransactionType,
            amount: Math.abs(amount),
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: `Admin: ${description}`,
            created_by: user.id,
        });

        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            action: `wallet_${type}`,
            entity_type: "wallet",
            entity_id: wallet.id,
            new_data: { amount, description },
        });

        return { success: true };
    } catch {
        return { success: false, error: "Failed to adjust wallet" };
    }
}

export async function getCoinsBalance(): Promise<ActionResult<number>> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: buyer } = await supabase
            .from("buyers")
            .select("coins_balance")
            .eq("profile_id", user.id)
            .maybeSingle();

        return { success: true, data: buyer?.coins_balance || 0 };
    } catch {
        return { success: false, error: "Failed to get coins" };
    }
}

export async function getCoinsLedger(options?: { page?: number; limit?: number }) {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const { data: entries, error, count } = await supabase
            .from("coins_ledger")
            .select("*", { count: "exact" })
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) return { success: false, error: error.message };

        return { success: true, data: { entries: entries || [], total: count || 0 } };
    } catch {
        return { success: false, error: "Failed to get coins ledger" };
    }
}

export async function adminAdjustCoins(
    targetProfileId: string,
    amount: number,
    type: "credit" | "debit",
    description: string
): Promise<ActionResult> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const supabase = await createUserClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile?.is_admin) return { success: false, error: "Unauthorized" };

        const adminClient = await createAdminClient();
        const { data: buyer } = await adminClient
            .from("buyers")
            .select("coins_balance")
            .eq("profile_id", targetProfileId)
            .maybeSingle();

        if (!buyer) return { success: false, error: "Buyer not found" };

        const balanceBefore = buyer.coins_balance;
        const adjustedAmount = Math.abs(Math.floor(amount));
        const balanceAfter = type === "credit"
            ? balanceBefore + adjustedAmount
            : balanceBefore - adjustedAmount;

        if (balanceAfter < 0) return { success: false, error: "Insufficient coins" };

        await adminClient
            .from("buyers")
            .update({ coins_balance: balanceAfter })
            .eq("profile_id", targetProfileId);

        await adminClient.from("coins_ledger").insert({
            profile_id: targetProfileId,
            type: type as TransactionType,
            amount: adjustedAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: `Admin: ${description}`,
            created_by: user.id,
        });

        return { success: true };
    } catch {
        return { success: false, error: "Failed to adjust coins" };
    }
}
