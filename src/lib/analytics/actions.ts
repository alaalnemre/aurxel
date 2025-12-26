'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-profile';

// ===== ADMIN ANALYTICS =====

export interface AdminAnalytics {
    totalOrders: number;
    totalRevenue: number;
    platformFees: number;
    ordersByStatus: Record<string, number>;
    activeDrivers: number;
    pendingCash: number;
    totalUsers: number;
    todayOrders: number;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
    const supabase = await createClient();
    const { profile } = await getProfile();

    if (!profile || profile.role !== 'admin') {
        return null;
    }

    const [
        ordersResult,
        usersResult,
        cashResult,
        driversResult,
    ] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at'),
        supabase.from('profiles').select('id, role'),
        supabase.from('cash_collections').select('amount_expected, status'),
        supabase.from('driver_profiles').select('id').eq('status', 'approved'),
    ]);

    const orders = ordersResult.data || [];
    const users = usersResult.data || [];
    const cash = cashResult.data || [];
    const drivers = driversResult.data || [];

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const platformFees = totalRevenue * 0.1; // 10% platform fee

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // Pending cash
    const pendingCash = cash
        .filter((c) => c.status === 'pending' || c.status === 'collected')
        .reduce((sum, c) => sum + Number(c.amount_expected || 0), 0);

    // Today's orders
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(
        (o) => o.created_at.split('T')[0] === today
    ).length;

    return {
        totalOrders,
        totalRevenue,
        platformFees,
        ordersByStatus,
        activeDrivers: drivers.length,
        pendingCash,
        totalUsers: users.length,
        todayOrders,
    };
}

// ===== SELLER ANALYTICS =====

export interface SellerAnalytics {
    totalOrders: number;
    totalEarnings: number;
    pendingSettlements: number;
    ordersByStatus: Record<string, number>;
    topProducts: { name: string; count: number }[];
}

export async function getSellerAnalytics(): Promise<SellerAnalytics | null> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'seller') {
        return null;
    }

    const [ordersResult, settlementsResult, productsResult] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status').eq('seller_id', user.id),
        supabase.from('settlements').select('seller_amount, status').eq('seller_id', user.id),
        supabase.from('order_items').select(`
            quantity,
            product:products(name)
        `).eq('products.seller_id', user.id),
    ]);

    const orders = ordersResult.data || [];
    const settlements = settlementsResult.data || [];

    // Calculate stats
    const totalOrders = orders.length;
    const totalEarnings = settlements
        .filter((s) => s.status === 'paid')
        .reduce((sum, s) => sum + Number(s.seller_amount || 0), 0);
    const pendingSettlements = settlements
        .filter((s) => s.status === 'pending')
        .reduce((sum, s) => sum + Number(s.seller_amount || 0), 0);

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // Top products (simplified - just return empty for now)
    const topProducts: { name: string; count: number }[] = [];

    return {
        totalOrders,
        totalEarnings,
        pendingSettlements,
        ordersByStatus,
        topProducts,
    };
}

// ===== BUYER ANALYTICS =====

export interface BuyerAnalytics {
    totalOrders: number;
    totalSpent: number;
    recentOrders: { id: string; status: string; total: number; created_at: string }[];
}

export async function getBuyerAnalytics(): Promise<BuyerAnalytics | null> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'buyer') {
        return null;
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    const ordersList = orders || [];

    return {
        totalOrders: ordersList.length,
        totalSpent: ordersList.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
        recentOrders: ordersList.map((o) => ({
            id: o.id,
            status: o.status,
            total: Number(o.total_amount),
            created_at: o.created_at,
        })),
    };
}

// ===== DRIVER ANALYTICS =====

export interface DriverAnalytics {
    completedDeliveries: number;
    totalEarnings: number;
    pendingCash: number;
    todayDeliveries: number;
}

export async function getDriverAnalytics(): Promise<DriverAnalytics | null> {
    const supabase = await createClient();
    const { user, profile } = await getProfile();

    if (!user || !profile || profile.role !== 'driver') {
        return null;
    }

    const [deliveriesResult, settlementsResult, cashResult] = await Promise.all([
        supabase.from('deliveries').select('id, status, delivered_at').eq('driver_id', user.id),
        supabase.from('settlements').select('driver_fee').eq('driver_id', user.id),
        supabase.from('cash_collections').select('amount_expected, status').eq('driver_id', user.id),
    ]);

    const deliveries = deliveriesResult.data || [];
    const settlements = settlementsResult.data || [];
    const cash = cashResult.data || [];

    const completedDeliveries = deliveries.filter((d) => d.status === 'delivered').length;
    const totalEarnings = settlements.reduce((sum, s) => sum + Number(s.driver_fee || 0), 0);
    const pendingCash = cash
        .filter((c) => c.status === 'pending' || c.status === 'collected')
        .reduce((sum, c) => sum + Number(c.amount_expected || 0), 0);

    // Today's deliveries
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.filter(
        (d) => d.delivered_at && d.delivered_at.split('T')[0] === today
    ).length;

    return {
        completedDeliveries,
        totalEarnings,
        pendingCash,
        todayDeliveries,
    };
}
