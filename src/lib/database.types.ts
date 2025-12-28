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
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
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
            cart_items: {
                Row: {
                    id: string
                    profile_id: string
                    product_id: string
                    quantity: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    product_id: string
                    quantity?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    product_id?: string
                    quantity?: number
                    created_at?: string
                    updated_at?: string
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
                    title_snapshot: string
                    price_snapshot: number
                    quantity: number
                    line_total: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id?: string | null
                    title_snapshot: string
                    price_snapshot: number
                    quantity: number
                    line_total: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string | null
                    title_snapshot?: string
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
            notifications: {
                Row: {
                    id: string
                    profile_id: string
                    title: string
                    body: string
                    is_read: boolean
                    link: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    title: string
                    body: string
                    is_read?: boolean
                    link?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    title?: string
                    body?: string
                    is_read?: boolean
                    link?: string | null
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
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
