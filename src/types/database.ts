// ============================================
// Supabase Database Types
// This file should be regenerated from Supabase CLI after migrations
// For now, we define the types manually based on our schema
// ============================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    role: 'buyer' | 'seller' | 'driver' | 'admin';
                    full_name: string | null;
                    phone: string | null;
                    locale: 'en' | 'ar';
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    role?: 'buyer' | 'seller' | 'driver' | 'admin';
                    full_name?: string | null;
                    phone?: string | null;
                    locale?: 'en' | 'ar';
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: 'buyer' | 'seller' | 'driver' | 'admin';
                    full_name?: string | null;
                    phone?: string | null;
                    locale?: 'en' | 'ar';
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            sellers: {
                Row: {
                    id: string;
                    user_id: string;
                    business_name: string;
                    address: string | null;
                    id_document_url: string | null;
                    status: 'pending' | 'approved' | 'rejected';
                    approved_at: string | null;
                    rejected_reason: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    business_name: string;
                    address?: string | null;
                    id_document_url?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    approved_at?: string | null;
                    rejected_reason?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    business_name?: string;
                    address?: string | null;
                    id_document_url?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    approved_at?: string | null;
                    rejected_reason?: string | null;
                    created_at?: string;
                };
            };
            drivers: {
                Row: {
                    id: string;
                    user_id: string;
                    id_document_url: string | null;
                    status: 'pending' | 'approved' | 'rejected';
                    approved_at: string | null;
                    rejected_reason: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    id_document_url?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    approved_at?: string | null;
                    rejected_reason?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    id_document_url?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    approved_at?: string | null;
                    rejected_reason?: string | null;
                    created_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name_en: string;
                    name_ar: string;
                    slug: string;
                    parent_id: string | null;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name_en: string;
                    name_ar: string;
                    slug: string;
                    parent_id?: string | null;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name_en?: string;
                    name_ar?: string;
                    slug?: string;
                    parent_id?: string | null;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    seller_id: string;
                    category_id: string | null;
                    title_en: string;
                    title_ar: string;
                    slug: string;
                    description_en: string | null;
                    description_ar: string | null;
                    price: number;
                    compare_at_price: number | null;
                    stock: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    seller_id: string;
                    category_id?: string | null;
                    title_en: string;
                    title_ar: string;
                    slug: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    price: number;
                    compare_at_price?: number | null;
                    stock?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    seller_id?: string;
                    category_id?: string | null;
                    title_en?: string;
                    title_ar?: string;
                    slug?: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    price?: number;
                    compare_at_price?: number | null;
                    stock?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            product_images: {
                Row: {
                    id: string;
                    product_id: string;
                    path: string;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    path: string;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    path?: string;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    buyer_id: string;
                    status: 'pending_seller' | 'preparing' | 'ready_for_pickup' | 'completed';
                    subtotal: number;
                    delivery_fee: number;
                    total: number;
                    address_line1: string;
                    address_line2: string | null;
                    city: string;
                    phone: string;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    buyer_id: string;
                    status?: 'pending_seller' | 'preparing' | 'ready_for_pickup' | 'completed';
                    subtotal: number;
                    delivery_fee: number;
                    total: number;
                    address_line1: string;
                    address_line2?: string | null;
                    city: string;
                    phone: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    buyer_id?: string;
                    status?: 'pending_seller' | 'preparing' | 'ready_for_pickup' | 'completed';
                    subtotal?: number;
                    delivery_fee?: number;
                    total?: number;
                    address_line1?: string;
                    address_line2?: string | null;
                    city?: string;
                    phone?: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            deliveries: {
                Row: {
                    id: string;
                    order_id: string;
                    driver_id: string | null;
                    status: 'available' | 'assigned' | 'picked_up' | 'delivered';
                    pickup_address: string;
                    pickup_phone: string;
                    dropoff_address: string;
                    dropoff_phone: string;
                    cod_amount: number;
                    assigned_at: string | null;
                    picked_up_at: string | null;
                    delivered_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    driver_id?: string | null;
                    status?: 'available' | 'assigned' | 'picked_up' | 'delivered';
                    pickup_address: string;
                    pickup_phone: string;
                    dropoff_address: string;
                    dropoff_phone: string;
                    cod_amount: number;
                    assigned_at?: string | null;
                    picked_up_at?: string | null;
                    delivered_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    driver_id?: string | null;
                    status?: 'available' | 'assigned' | 'picked_up' | 'delivered';
                    pickup_address?: string;
                    pickup_phone?: string;
                    dropoff_address?: string;
                    dropoff_phone?: string;
                    cod_amount?: number;
                    assigned_at?: string | null;
                    picked_up_at?: string | null;
                    delivered_at?: string | null;
                    created_at?: string;
                };
            };
            wallet_accounts: {
                Row: {
                    id: string;
                    owner_id: string;
                    balance: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    balance?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    balance?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            topup_codes: {
                Row: {
                    id: string;
                    code: string;
                    amount: number;
                    status: 'active' | 'redeemed' | 'revoked';
                    issued_by_admin_id: string;
                    redeemed_by_user_id: string | null;
                    redeemed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    amount: number;
                    status?: 'active' | 'redeemed' | 'revoked';
                    issued_by_admin_id: string;
                    redeemed_by_user_id?: string | null;
                    redeemed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    amount?: number;
                    status?: 'active' | 'redeemed' | 'revoked';
                    issued_by_admin_id?: string;
                    redeemed_by_user_id?: string | null;
                    redeemed_at?: string | null;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    body: string;
                    link: string | null;
                    read_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    title: string;
                    body: string;
                    link?: string | null;
                    read_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: string;
                    title?: string;
                    body?: string;
                    link?: string | null;
                    read_at?: string | null;
                    created_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    actor_id: string;
                    action: string;
                    entity: string;
                    entity_id: string;
                    metadata: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    actor_id: string;
                    action: string;
                    entity: string;
                    entity_id: string;
                    metadata?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    actor_id?: string;
                    action?: string;
                    entity?: string;
                    entity_id?: string;
                    metadata?: Json | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: 'buyer' | 'seller' | 'driver' | 'admin';
            kyc_status: 'pending' | 'approved' | 'rejected';
            order_status: 'pending_seller' | 'preparing' | 'ready_for_pickup' | 'completed';
            delivery_status: 'available' | 'assigned' | 'picked_up' | 'delivered';
            topup_code_status: 'active' | 'redeemed' | 'revoked';
        };
    };
};
