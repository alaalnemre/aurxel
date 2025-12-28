// Database Types for JordanMarket
// Auto-generated types should match Supabase schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Enums
export type OrderStatus =
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";

export type DeliveryStatus = "available" | "assigned" | "picked_up" | "delivered";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type TransactionType = "credit" | "debit" | "refund" | "adjustment";

export type DisputeStatus = "open" | "investigating" | "resolved" | "closed";

export type NotificationType =
    | "order_update"
    | "delivery_update"
    | "wallet_update"
    | "coins_update"
    | "system"
    | "promotion";

// Table Types
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    is_buyer: boolean;
    is_seller: boolean;
    is_driver: boolean;
    is_admin: boolean;
    seller_verified: boolean;
    driver_verified: boolean;
    seller_verification_status: VerificationStatus | null;
    driver_verification_status: VerificationStatus | null;
    seller_activated_at: string | null;
    driver_activated_at: string | null;
    default_address_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Buyer {
    id: string;
    profile_id: string;
    preferred_payment: string;
    created_at: string;
}

export interface Seller {
    id: string;
    profile_id: string;
    business_name: string;
    business_description: string | null;
    business_address: string;
    logo_url: string | null;
    banner_url: string | null;
    rating_average: number;
    rating_count: number;
    total_sales: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface Driver {
    id: string;
    profile_id: string;
    license_number: string;
    vehicle_type: string;
    vehicle_plate: string;
    is_online: boolean;
    current_latitude: number | null;
    current_longitude: number | null;
    rating_average: number;
    rating_count: number;
    total_deliveries: number;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    seller_id: string;
    name: string;
    name_ar: string;
    description: string | null;
    description_ar: string | null;
    category: string;
    base_price: number;
    images: string[];
    is_active: boolean;
    stock_quantity: number;
    rating_average: number;
    rating_count: number;
    total_sold: number;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    name_ar: string;
    sku: string | null;
    price_adjustment: number;
    stock_quantity: number;
    attributes: Json;
    is_active: boolean;
    created_at: string;
}

export interface Cart {
    id: string;
    profile_id: string;
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    created_at: string;
}

export interface Address {
    id: string;
    profile_id: string;
    label: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    area: string | null;
    notes: string | null;
    latitude: number | null;
    longitude: number | null;
    is_default: boolean;
    created_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    buyer_id: string;
    seller_id: string;
    status: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    discount_amount: number;
    coins_used: number;
    coins_discount: number;
    total: number;
    delivery_address: Json;
    notes: string | null;
    placed_at: string;
    accepted_at: string | null;
    preparing_at: string | null;
    ready_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string | null;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}

export interface Delivery {
    id: string;
    order_id: string;
    driver_id: string | null;
    status: DeliveryStatus;
    pickup_address: Json;
    delivery_address: Json;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    delivery_latitude: number | null;
    delivery_longitude: number | null;
    estimated_pickup_time: string | null;
    estimated_delivery_time: string | null;
    actual_pickup_time: string | null;
    actual_delivery_time: string | null;
    delivery_proof_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface DeliveryRequest {
    id: string;
    delivery_id: string;
    driver_id: string;
    status: "pending" | "accepted" | "rejected" | "expired";
    requested_at: string;
    responded_at: string | null;
}

export interface Wallet {
    id: string;
    profile_id: string;
    balance: number;
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: string;
    wallet_id: string;
    type: TransactionType;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
    reference_type: string | null;
    reference_id: string | null;
    created_by: string | null;
    created_at: string;
}

export interface CoinsLedger {
    id: string;
    profile_id: string;
    type: TransactionType;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
    reference_type: string | null;
    reference_id: string | null;
    created_by: string | null;
    created_at: string;
}

export interface Discount {
    id: string;
    code: string;
    description: string | null;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_amount: number | null;
    max_discount_amount: number | null;
    usage_limit: number | null;
    usage_count: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    created_at: string;
}

export interface Notification {
    id: string;
    profile_id: string;
    type: NotificationType;
    title: string;
    title_ar: string;
    message: string;
    message_ar: string;
    data: Json | null;
    is_read: boolean;
    created_at: string;
}

export interface Rating {
    id: string;
    order_id: string;
    rater_id: string;
    rated_type: "seller" | "driver" | "product";
    rated_id: string;
    rating: number;
    review: string | null;
    created_at: string;
}

export interface Tip {
    id: string;
    delivery_id: string;
    driver_id: string;
    buyer_id: string;
    amount: number;
    created_at: string;
}

export interface Dispute {
    id: string;
    order_id: string;
    raised_by: string;
    status: DisputeStatus;
    reason: string;
    description: string;
    resolution: string | null;
    resolved_by: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data: Json | null;
    new_data: Json | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// Database Schema Type for Supabase
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile> & { id: string; email: string; full_name: string };
                Update: Partial<Profile>;
                Relationships: [];
            };
            buyers: {
                Row: Buyer;
                Insert: Partial<Buyer> & { profile_id: string };
                Update: Partial<Buyer>;
                Relationships: [];
            };
            sellers: {
                Row: Seller;
                Insert: Partial<Seller> & {
                    profile_id: string;
                    business_name: string;
                    business_address: string;
                };
                Update: Partial<Seller>;
                Relationships: [];
            };
            drivers: {
                Row: Driver;
                Insert: Partial<Driver> & {
                    profile_id: string;
                    license_number: string;
                    vehicle_type: string;
                    vehicle_plate: string;
                };
                Update: Partial<Driver>;
                Relationships: [];
            };
            products: {
                Row: Product;
                Insert: Partial<Product> & {
                    seller_id: string;
                    name: string;
                    name_ar: string;
                    category: string;
                    base_price: number;
                };
                Update: Partial<Product>;
                Relationships: [];
            };
            product_variants: {
                Row: ProductVariant;
                Insert: Partial<ProductVariant> & {
                    product_id: string;
                    name: string;
                    name_ar: string;
                };
                Update: Partial<ProductVariant>;
                Relationships: [];
            };
            carts: {
                Row: Cart;
                Insert: Partial<Cart> & { profile_id: string };
                Update: Partial<Cart>;
                Relationships: [];
            };
            cart_items: {
                Row: CartItem;
                Insert: Partial<CartItem> & {
                    cart_id: string;
                    product_id: string;
                    quantity: number;
                    unit_price: number;
                };
                Update: Partial<CartItem>;
                Relationships: [];
            };
            addresses: {
                Row: Address;
                Insert: Partial<Address> & {
                    profile_id: string;
                    label: string;
                    address_line_1: string;
                    city: string;
                };
                Update: Partial<Address>;
                Relationships: [];
            };
            orders: {
                Row: Order;
                Insert: Partial<Order> & {
                    buyer_id: string;
                    seller_id: string;
                    subtotal: number;
                    total: number;
                    delivery_address: Json;
                };
                Update: Partial<Order>;
                Relationships: [];
            };
            order_items: {
                Row: OrderItem;
                Insert: Partial<OrderItem> & {
                    order_id: string;
                    product_id: string;
                    product_name: string;
                    quantity: number;
                    unit_price: number;
                    total_price: number;
                };
                Update: Partial<OrderItem>;
                Relationships: [];
            };
            deliveries: {
                Row: Delivery;
                Insert: Partial<Delivery> & {
                    order_id: string;
                    pickup_address: Json;
                    delivery_address: Json;
                };
                Update: Partial<Delivery>;
                Relationships: [];
            };
            delivery_requests: {
                Row: DeliveryRequest;
                Insert: Partial<DeliveryRequest> & {
                    delivery_id: string;
                    driver_id: string;
                };
                Update: Partial<DeliveryRequest>;
                Relationships: [];
            };
            wallets: {
                Row: Wallet;
                Insert: Partial<Wallet> & { profile_id: string };
                Update: Partial<Wallet>;
                Relationships: [];
            };
            wallet_transactions: {
                Row: WalletTransaction;
                Insert: Partial<WalletTransaction> & {
                    wallet_id: string;
                    type: TransactionType;
                    amount: number;
                    balance_before: number;
                    balance_after: number;
                    description: string;
                };
                Update: Partial<WalletTransaction>;
                Relationships: [];
            };
            coins_ledger: {
                Row: CoinsLedger;
                Insert: Partial<CoinsLedger> & {
                    profile_id: string;
                    type: TransactionType;
                    amount: number;
                    balance_before: number;
                    balance_after: number;
                    description: string;
                };
                Update: Partial<CoinsLedger>;
                Relationships: [];
            };
            discounts: {
                Row: Discount;
                Insert: Partial<Discount> & {
                    code: string;
                    discount_type: "percentage" | "fixed";
                    discount_value: number;
                    valid_from: string;
                    valid_until: string;
                };
                Update: Partial<Discount>;
                Relationships: [];
            };
            notifications: {
                Row: Notification;
                Insert: Partial<Notification> & {
                    profile_id: string;
                    type: NotificationType;
                    title: string;
                    title_ar: string;
                    message: string;
                    message_ar: string;
                };
                Update: Partial<Notification>;
                Relationships: [];
            };
            ratings: {
                Row: Rating;
                Insert: Partial<Rating> & {
                    order_id: string;
                    rater_id: string;
                    rated_type: "seller" | "driver" | "product";
                    rated_id: string;
                    rating: number;
                };
                Update: Partial<Rating>;
                Relationships: [];
            };
            tips: {
                Row: Tip;
                Insert: Partial<Tip> & {
                    delivery_id: string;
                    driver_id: string;
                    buyer_id: string;
                    amount: number;
                };
                Update: Partial<Tip>;
                Relationships: [];
            };
            disputes: {
                Row: Dispute;
                Insert: Partial<Dispute> & {
                    order_id: string;
                    raised_by: string;
                    reason: string;
                    description: string;
                };
                Update: Partial<Dispute>;
                Relationships: [];
            };
            admin_logs: {
                Row: AdminLog;
                Insert: Partial<AdminLog> & {
                    admin_id: string;
                    action: string;
                    entity_type: string;
                    entity_id: string;
                };
                Update: Partial<AdminLog>;
                Relationships: [];
            };
        };
        Enums: {
            order_status: OrderStatus;
            delivery_status: DeliveryStatus;
            verification_status: VerificationStatus;
            transaction_type: TransactionType;
            dispute_status: DisputeStatus;
            notification_type: NotificationType;
        };
    };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T];

// Extended types with relations
export interface OrderWithItems extends Order {
    items: OrderItem[];
    seller?: Seller;
    delivery?: Delivery;
}

export interface ProductWithVariants extends Product {
    variants: ProductVariant[];
    seller?: Seller;
}

export interface CartWithItems extends Cart {
    items: (CartItem & {
        product: Product;
        variant?: ProductVariant;
    })[];
}

export interface DeliveryWithDetails extends Delivery {
    order: Order;
    driver?: Driver;
}
