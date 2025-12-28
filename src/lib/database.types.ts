export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string | null
                    city: string | null
                    address: string | null
                    is_admin: boolean
                    is_buyer: boolean
                    seller_requested: boolean
                    seller_verified: boolean
                    driver_requested: boolean
                    driver_verified: boolean
                    seller_activated_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone?: string | null
                    city?: string | null
                    address?: string | null
                    is_admin?: boolean
                    is_buyer?: boolean
                    seller_requested?: boolean
                    seller_verified?: boolean
                    driver_requested?: boolean
                    driver_verified?: boolean
                    seller_activated_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    phone?: string | null
                    city?: string | null
                    address?: string | null
                    is_admin?: boolean
                    is_buyer?: boolean
                    seller_requested?: boolean
                    seller_verified?: boolean
                    driver_requested?: boolean
                    driver_verified?: boolean
                    seller_activated_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            notifications: {
                Row: {
                    id: string
                    profile_id: string
                    type: Database["public"]["Enums"]["notification_type"]
                    title_key: string
                    message_key: string
                    metadata: Json | null
                    dedupe_key: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    type: Database["public"]["Enums"]["notification_type"]
                    title_key: string
                    message_key: string
                    metadata?: Json | null
                    dedupe_key?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    type?: Database["public"]["Enums"]["notification_type"]
                    title_key?: string
                    message_key?: string
                    metadata?: Json | null
                    dedupe_key?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sellers: {
                Row: {
                    id: string
                    profile_id: string
                    store_name: string
                    description: string | null
                    store_address: string | null
                    store_city: string | null
                    store_phone: string | null
                    logo_url: string | null
                    status: Database["public"]["Enums"]["seller_status"]
                    rejection_reason: string | null
                    commission_rate: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    store_name: string
                    description?: string | null
                    store_address?: string | null
                    store_city?: string | null
                    store_phone?: string | null
                    logo_url?: string | null
                    status?: Database["public"]["Enums"]["seller_status"]
                    rejection_reason?: string | null
                    commission_rate?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    store_name?: string
                    description?: string | null
                    store_address?: string | null
                    store_city?: string | null
                    store_phone?: string | null
                    logo_url?: string | null
                    status?: Database["public"]["Enums"]["seller_status"]
                    rejection_reason?: string | null
                    commission_rate?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            drivers: {
                Row: {
                    id: string
                    profile_id: string
                    vehicle_type: string
                    plate_number: string
                    license_url: string | null
                    status: Database["public"]["Enums"]["driver_status"]
                    rejection_reason: string | null
                    available_for_delivery: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    vehicle_type: string
                    plate_number: string
                    license_url?: string | null
                    status?: Database["public"]["Enums"]["driver_status"]
                    rejection_reason?: string | null
                    available_for_delivery?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    vehicle_type?: string
                    plate_number?: string
                    license_url?: string | null
                    status?: Database["public"]["Enums"]["driver_status"]
                    rejection_reason?: string | null
                    available_for_delivery?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            products: {
                Row: {
                    id: string
                    seller_id: string
                    title: string
                    description: string | null
                    price_jod: number
                    compare_at_price: number | null
                    stock: number
                    is_active: boolean
                    category: string | null
                    images: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    seller_id: string
                    title: string
                    description?: string | null
                    price_jod: number
                    compare_at_price?: number | null
                    stock?: number
                    is_active?: boolean
                    category?: string | null
                    images?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    seller_id?: string
                    title?: string
                    description?: string | null
                    price_jod?: number
                    compare_at_price?: number | null
                    stock?: number
                    is_active?: boolean
                    category?: string | null
                    images?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            product_variants: {
                Row: {
                    id: string
                    product_id: string
                    name: string
                    sku: string | null
                    price_jod: number
                    compare_at_price: number | null
                    stock: number
                    is_default: boolean
                    is_active: boolean
                    position: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    name: string
                    sku?: string | null
                    price_jod: number
                    compare_at_price?: number | null
                    stock?: number
                    is_default?: boolean
                    is_active?: boolean
                    position?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    name?: string
                    sku?: string | null
                    price_jod?: number
                    compare_at_price?: number | null
                    stock?: number
                    is_default?: boolean
                    is_active?: boolean
                    position?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            cart_items: {
                Row: {
                    id: string
                    profile_id: string
                    product_id: string
                    variant_id: string | null
                    quantity: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    product_id: string
                    variant_id?: string | null
                    quantity?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    product_id?: string
                    variant_id?: string | null
                    quantity?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            discount_codes: {
                Row: {
                    id: string
                    code: string
                    description: string | null
                    discount_type: Database["public"]["Enums"]["discount_type"]
                    discount_value: number
                    max_uses: number | null
                    max_uses_per_user: number | null
                    current_uses: number
                    min_order_amount: number | null
                    starts_at: string
                    ends_at: string | null
                    is_active: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    description?: string | null
                    discount_type: Database["public"]["Enums"]["discount_type"]
                    discount_value: number
                    max_uses?: number | null
                    max_uses_per_user?: number | null
                    current_uses?: number
                    min_order_amount?: number | null
                    starts_at?: string
                    ends_at?: string | null
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    description?: string | null
                    discount_type?: Database["public"]["Enums"]["discount_type"]
                    discount_value?: number
                    max_uses?: number | null
                    max_uses_per_user?: number | null
                    current_uses?: number
                    min_order_amount?: number | null
                    starts_at?: string
                    ends_at?: string | null
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            discount_redemptions: {
                Row: {
                    id: string
                    discount_id: string
                    order_id: string
                    profile_id: string
                    discount_value_applied: number
                    redeemed_at: string
                }
                Insert: {
                    id?: string
                    discount_id: string
                    order_id: string
                    profile_id: string
                    discount_value_applied: number
                    redeemed_at?: string
                }
                Update: {
                    id?: string
                    discount_id?: string
                    order_id?: string
                    profile_id?: string
                    discount_value_applied?: number
                    redeemed_at?: string
                }
                Relationships: []
            }
            featured_entities: {
                Row: {
                    id: string
                    entity_type: Database["public"]["Enums"]["featured_entity_type"]
                    seller_id: string | null
                    product_id: string | null
                    title_override: string | null
                    subtitle_override: string | null
                    image_override: string | null
                    priority: number
                    starts_at: string | null
                    ends_at: string | null
                    is_active: boolean
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    entity_type: Database["public"]["Enums"]["featured_entity_type"]
                    seller_id?: string | null
                    product_id?: string | null
                    title_override?: string | null
                    subtitle_override?: string | null
                    image_override?: string | null
                    priority?: number
                    starts_at?: string | null
                    ends_at?: string | null
                    is_active?: boolean
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    entity_type?: Database["public"]["Enums"]["featured_entity_type"]
                    seller_id?: string | null
                    product_id?: string | null
                    title_override?: string | null
                    subtitle_override?: string | null
                    image_override?: string | null
                    priority?: number
                    starts_at?: string | null
                    ends_at?: string | null
                    is_active?: boolean
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            badges: {
                Row: {
                    id: string
                    key: string
                    title_en: string
                    title_ar: string
                    description_en: string
                    description_ar: string
                    icon: string
                    applies_to: Database["public"]["Enums"]["badge_applies_to"]
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    title_en: string
                    title_ar: string
                    description_en: string
                    description_ar: string
                    icon?: string
                    applies_to: Database["public"]["Enums"]["badge_applies_to"]
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    title_en?: string
                    title_ar?: string
                    description_en?: string
                    description_ar?: string
                    icon?: string
                    applies_to?: Database["public"]["Enums"]["badge_applies_to"]
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            profile_badges: {
                Row: {
                    id: string
                    profile_id: string
                    badge_id: string
                    awarded_reason: string | null
                    awarded_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    badge_id: string
                    awarded_reason?: string | null
                    awarded_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    badge_id?: string
                    awarded_reason?: string | null
                    awarded_at?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    buyer_profile_id: string
                    seller_id: string
                    status: Database["public"]["Enums"]["order_status"]
                    subtotal: number
                    delivery_fee: number
                    total: number
                    discount_code_id: string | null
                    discount_amount: number
                    address: string
                    city: string
                    phone: string
                    notes: string | null
                    created_at: string
                    accepted_at: string | null
                    preparing_at: string | null
                    ready_at: string | null
                    delivered_at: string | null
                    completed_at: string | null
                    cancelled_at: string | null
                    cancellation_reason: string | null
                }
                Insert: {
                    id?: string
                    buyer_profile_id: string
                    seller_id: string
                    status?: Database["public"]["Enums"]["order_status"]
                    subtotal: number
                    delivery_fee?: number
                    total: number
                    discount_code_id?: string | null
                    discount_amount?: number
                    address: string
                    city: string
                    phone: string
                    notes?: string | null
                    created_at?: string
                    accepted_at?: string | null
                    preparing_at?: string | null
                    ready_at?: string | null
                    delivered_at?: string | null
                    completed_at?: string | null
                    cancelled_at?: string | null
                    cancellation_reason?: string | null
                }
                Update: {
                    id?: string
                    buyer_profile_id?: string
                    seller_id?: string
                    status?: Database["public"]["Enums"]["order_status"]
                    subtotal?: number
                    delivery_fee?: number
                    total?: number
                    address?: string
                    city?: string
                    phone?: string
                    notes?: string | null
                    created_at?: string
                    accepted_at?: string | null
                    preparing_at?: string | null
                    ready_at?: string | null
                    delivered_at?: string | null
                    completed_at?: string | null
                    cancelled_at?: string | null
                    cancellation_reason?: string | null
                }
                Relationships: []
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    variant_id: string | null
                    title_snapshot: string
                    variant_name_snapshot: string | null
                    price_snapshot: number
                    quantity: number
                    line_total: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id?: string | null
                    variant_id?: string | null
                    title_snapshot: string
                    variant_name_snapshot?: string | null
                    price_snapshot: number
                    quantity: number
                    line_total: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string | null
                    variant_id?: string | null
                    title_snapshot?: string
                    variant_name_snapshot?: string | null
                    price_snapshot?: number
                    quantity?: number
                    line_total?: number
                    created_at?: string
                }
                Relationships: []
            }
            deliveries: {
                Row: {
                    id: string
                    order_id: string
                    driver_id: string | null
                    status: Database["public"]["Enums"]["delivery_status"]
                    assigned_at: string | null
                    picked_up_at: string | null
                    delivered_at: string | null
                    driver_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    driver_id?: string | null
                    status?: Database["public"]["Enums"]["delivery_status"]
                    assigned_at?: string | null
                    picked_up_at?: string | null
                    delivered_at?: string | null
                    driver_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    driver_id?: string | null
                    status?: Database["public"]["Enums"]["delivery_status"]
                    assigned_at?: string | null
                    picked_up_at?: string | null
                    delivered_at?: string | null
                    driver_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            disputes: {
                Row: {
                    id: string
                    order_id: string
                    opened_by: string
                    reason: string
                    status: Database["public"]["Enums"]["dispute_status"]
                    admin_notes: string | null
                    resolution: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    opened_by: string
                    reason: string
                    status?: Database["public"]["Enums"]["dispute_status"]
                    admin_notes?: string | null
                    resolution?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    opened_by?: string
                    reason?: string
                    status?: Database["public"]["Enums"]["dispute_status"]
                    admin_notes?: string | null
                    resolution?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }

            wallets: {
                Row: {
                    id: string
                    profile_id: string
                    balance_jod: number
                    coins: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    balance_jod?: number
                    coins?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    balance_jod?: number
                    coins?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            wallet_transactions: {
                Row: {
                    id: string
                    wallet_id: string
                    type: Database["public"]["Enums"]["wallet_transaction_type"]
                    amount: number
                    balance_after: number
                    reference_id: string | null
                    reference_type: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    wallet_id: string
                    type: Database["public"]["Enums"]["wallet_transaction_type"]
                    amount: number
                    balance_after: number
                    reference_id?: string | null
                    reference_type?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    wallet_id?: string
                    type?: Database["public"]["Enums"]["wallet_transaction_type"]
                    amount?: number
                    balance_after?: number
                    reference_id?: string | null
                    reference_type?: string | null
                    description?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            payouts: {
                Row: {
                    id: string
                    seller_id: string
                    amount: number
                    status: Database["public"]["Enums"]["payout_status"]
                    payment_method: string
                    payment_details: Json | null
                    admin_notes: string | null
                    processed_by: string | null
                    processed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    seller_id: string
                    amount: number
                    status?: Database["public"]["Enums"]["payout_status"]
                    payment_method: string
                    payment_details?: Json | null
                    admin_notes?: string | null
                    processed_by?: string | null
                    processed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    seller_id?: string
                    amount?: number
                    status?: Database["public"]["Enums"]["payout_status"]
                    payment_method?: string
                    payment_details?: Json | null
                    admin_notes?: string | null
                    processed_by?: string | null
                    processed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    id: string
                    order_id: string
                    buyer_profile_id: string
                    seller_id: string
                    rating: number
                    comment: string | null
                    is_visible: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    buyer_profile_id: string
                    seller_id: string
                    rating: number
                    comment?: string | null
                    is_visible?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    buyer_profile_id?: string
                    seller_id?: string
                    rating?: number
                    comment?: string | null
                    is_visible?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            order_commissions: {
                Row: {
                    id: string
                    order_id: string
                    seller_id: string
                    order_total: number
                    commission_rate_snapshot: number
                    commission_amount: number
                    platform_revenue: number
                    seller_earnings: number
                    is_settled: boolean
                    settled_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    seller_id: string
                    order_total: number
                    commission_rate_snapshot: number
                    commission_amount: number
                    platform_revenue: number
                    seller_earnings: number
                    is_settled?: boolean
                    settled_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    seller_id?: string
                    order_total?: number
                    commission_rate_snapshot?: number
                    commission_amount?: number
                    platform_revenue?: number
                    seller_earnings?: number
                    is_settled?: boolean
                    settled_at?: string | null
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            order_status: "placed" | "accepted" | "preparing" | "ready_for_pickup" | "assigned" | "picked_up" | "delivered" | "completed" | "cancelled"
            delivery_status: "available" | "assigned" | "picked_up" | "delivered"
            seller_status: "pending" | "approved" | "rejected"
            driver_status: "pending" | "approved" | "rejected"
            dispute_status: "open" | "investigating" | "resolved" | "rejected"
            wallet_transaction_type: "credit" | "debit" | "transfer" | "payout" | "commission" | "refund" | "delivery_earning"
            payout_status: "pending" | "processing" | "completed" | "failed" | "cancelled"
            discount_type: "percentage" | "fixed"
            featured_entity_type: "store" | "product"
            badge_applies_to: "buyer" | "seller" | "driver"
            notification_type: "order_status" | "discount" | "payout" | "badge" | "featured" | "system"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
