// ============================================
// JordanMarket - Core Type Definitions
// ============================================

// User Roles
export type UserRole = 'buyer' | 'seller' | 'driver' | 'admin';

// KYC Status for sellers and drivers
export type KycStatus = 'pending' | 'approved' | 'rejected';

// Order Status - LOCKED FLOW
// pending_seller -> preparing -> ready_for_pickup -> completed
export type OrderStatus = 'pending_seller' | 'preparing' | 'ready_for_pickup' | 'completed';

// Delivery Status - LOCKED FLOW  
// available -> assigned -> picked_up -> delivered
export type DeliveryStatus = 'available' | 'assigned' | 'picked_up' | 'delivered';

// Support Ticket Status
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Support Ticket Priority
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Wallet Transaction Types
export type WalletTransactionType =
    | 'topup'           // Admin-issued code redemption
    | 'purchase'        // Buyer payment
    | 'sale_credit'     // Seller receives from sale
    | 'delivery_fee'    // Driver receives delivery fee
    | 'refund'          // Refund to buyer
    | 'withdrawal';     // Cash out (future)

// Top-up Code Status
export type TopupCodeStatus = 'active' | 'redeemed' | 'revoked';

// Notification Types
export type NotificationType =
    | 'order_placed'
    | 'order_status_changed'
    | 'delivery_assigned'
    | 'delivery_status_changed'
    | 'kyc_approved'
    | 'kyc_rejected'
    | 'wallet_credited'
    | 'ticket_reply'
    | 'system';

// ============================================
// Database Record Types
// ============================================

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string | null;
    phone: string | null;
    locale: 'en' | 'ar';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Seller {
    id: string;
    user_id: string;
    business_name: string;
    address: string | null;
    id_document_url: string | null;
    status: KycStatus;
    approved_at: string | null;
    rejected_reason: string | null;
    created_at: string;
}

export interface Driver {
    id: string;
    user_id: string;
    id_document_url: string | null;
    status: KycStatus;
    approved_at: string | null;
    rejected_reason: string | null;
    created_at: string;
}

export interface Category {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    parent_id: string | null;
    sort_order: number;
    created_at: string;
}

export interface Product {
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
}

export interface ProductImage {
    id: string;
    product_id: string;
    path: string;
    sort_order: number;
    created_at: string;
}

export interface Cart {
    id: string;
    buyer_id: string;
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    qty: number;
    created_at: string;
}

export interface Order {
    id: string;
    buyer_id: string;
    status: OrderStatus;
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
}

export interface OrderItem {
    id: string;
    order_id: string;
    seller_id: string;
    product_id: string;
    title_snapshot: string;
    price_snapshot: number;
    qty: number;
    created_at: string;
}

export interface Delivery {
    id: string;
    order_id: string;
    driver_id: string | null;
    status: DeliveryStatus;
    pickup_address: string;
    pickup_phone: string;
    dropoff_address: string;
    dropoff_phone: string;
    cod_amount: number;
    assigned_at: string | null;
    picked_up_at: string | null;
    delivered_at: string | null;
    created_at: string;
}

export interface Rating {
    id: string;
    order_id: string;
    buyer_id: string;
    seller_id: string | null;
    driver_id: string | null;
    stars: number;
    comment: string | null;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
}

export interface SupportTicket {
    id: string;
    created_by: string;
    category: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    created_at: string;
    updated_at: string;
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    body: string;
    created_at: string;
}

export interface WalletAccount {
    id: string;
    owner_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: string;
    account_id: string;
    type: WalletTransactionType;
    amount: number;
    ref_table: string | null;
    ref_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface TopupCode {
    id: string;
    code: string;
    amount: number;
    status: TopupCodeStatus;
    issued_by_admin_id: string;
    redeemed_by_user_id: string | null;
    redeemed_at: string | null;
    created_at: string;
}

export interface AuditLog {
    id: string;
    actor_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
}
