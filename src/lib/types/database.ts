// Database types for JordanMarket

export type UserRole = 'buyer' | 'seller' | 'driver' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface SellerProfile {
    id: string;
    user_id: string;
    business_name: string;
    business_address: string | null;
    business_phone: string | null;
    business_description: string | null;
    documents: string[];
    status: ApprovalStatus;
    rejection_reason: string | null;
    approved_at: string | null;
    approved_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface DriverProfile {
    id: string;
    user_id: string;
    vehicle_type: string | null;
    vehicle_plate: string | null;
    license_number: string | null;
    documents: string[];
    status: ApprovalStatus;
    rejection_reason: string | null;
    approved_at: string | null;
    approved_by: string | null;
    created_at: string;
    updated_at: string;
}

// Extended profile with role-specific data
export interface UserWithProfile {
    user: {
        id: string;
        email: string;
    };
    profile: Profile;
    sellerProfile?: SellerProfile | null;
    driverProfile?: DriverProfile | null;
}

// Authorization result
export interface AuthorizationResult {
    authorized: boolean;
    user?: {
        id: string;
        email: string;
    };
    profile?: Profile;
    sellerProfile?: SellerProfile | null;
    driverProfile?: DriverProfile | null;
    redirectTo?: string;
    reason?: string;
}

// Category
export interface Category {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    description_en: string | null;
    description_ar: string | null;
    icon: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

// Product
export interface Product {
    id: string;
    seller_id: string;
    category_id: string | null;
    name: string;
    name_ar: string | null;
    description: string | null;
    description_ar: string | null;
    price: number;
    compare_at_price: number | null;
    stock: number;
    sku: string | null;
    is_active: boolean;
    is_featured: boolean;
    views: number;
    created_at: string;
    updated_at: string;
}

// Product with relations
export interface ProductWithDetails extends Product {
    category?: Category | null;
    images?: ProductImage[];
    seller?: {
        id: string;
        full_name: string | null;
        business_name?: string;
    };
}

// Product Image
export interface ProductImage {
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    created_at: string;
}

// Order Status
export type OrderStatus =
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready_for_pickup'
    | 'assigned'
    | 'picked_up'
    | 'delivered'
    | 'cancelled';

// Order
export interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    status: OrderStatus;
    total_amount: number;
    payment_method: string;
    delivery_address: string | null;
    delivery_phone: string | null;
    delivery_notes: string | null;
    placed_at: string;
    accepted_at: string | null;
    preparing_at: string | null;
    ready_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
}

// Order Item
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_name_ar: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}

// Order with relations
export interface OrderWithDetails extends Order {
    items?: OrderItem[];
    buyer?: {
        id: string;
        full_name: string | null;
    };
    seller?: {
        id: string;
        full_name: string | null;
        business_name?: string;
    };
}

// Cart Item (client-side)
export interface CartItem {
    productId: string;
    productName: string;
    productNameAr: string | null;
    sellerId: string;
    sellerName: string | null;
    price: number;
    quantity: number;
    imageUrl: string | null;
    stock: number;
}

// Delivery Status
export type DeliveryStatus = 'available' | 'assigned' | 'picked_up' | 'delivered';

// Delivery
export interface Delivery {
    id: string;
    order_id: string;
    driver_id: string | null;
    status: DeliveryStatus;
    assigned_at: string | null;
    picked_up_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
}

// Delivery with relations
export interface DeliveryWithDetails extends Delivery {
    order?: OrderWithDetails;
    driver?: {
        id: string;
        full_name: string | null;
        phone: string | null;
    };
}

// Cash Collection Status
export type CashCollectionStatus = 'pending' | 'collected' | 'confirmed';

// Settlement Status
export type SettlementStatus = 'pending' | 'paid';

// Cash Collection
export interface CashCollection {
    id: string;
    order_id: string;
    driver_id: string;
    amount_expected: number;
    amount_collected: number | null;
    status: CashCollectionStatus;
    collected_at: string | null;
    confirmed_at: string | null;
    confirmed_by: string | null;
    created_at: string;
    updated_at: string;
}

// Cash Collection with relations
export interface CashCollectionWithDetails extends CashCollection {
    order?: OrderWithDetails;
    driver?: {
        id: string;
        full_name: string | null;
        phone: string | null;
    };
}

// Settlement
export interface Settlement {
    id: string;
    order_id: string;
    cash_collection_id: string;
    seller_id: string;
    driver_id: string;
    order_amount: number;
    platform_fee: number;
    driver_fee: number;
    seller_amount: number;
    status: SettlementStatus;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
}

// Settlement with relations
export interface SettlementWithDetails extends Settlement {
    order?: OrderWithDetails;
    seller?: {
        id: string;
        full_name: string | null;
    };
    driver?: {
        id: string;
        full_name: string | null;
    };
}

// QANZ Top-up Code Status
export type TopupCodeStatus = 'active' | 'redeemed' | 'voided';

// QANZ Transaction Type
export type QanzTransactionType = 'topup' | 'spend' | 'refund' | 'admin_adjustment';

// QANZ Top-up Code
export interface QanzTopupCode {
    id: string;
    code: string;
    amount: number;
    status: TopupCodeStatus;
    created_by: string;
    redeemed_by: string | null;
    redeemed_at: string | null;
    created_at: string;
    updated_at: string;
}

// QANZ Top-up Code with relations
export interface QanzTopupCodeWithDetails extends QanzTopupCode {
    creator?: {
        id: string;
        full_name: string | null;
    };
    redeemer?: {
        id: string;
        full_name: string | null;
    };
}

// QANZ Ledger Entry
export interface QanzLedgerEntry {
    id: string;
    user_id: string;
    type: QanzTransactionType;
    amount: number;
    reference_type: string | null;
    reference_id: string | null;
    description: string | null;
    created_by: string | null;
    created_at: string;
}

// QANZ Balance
export interface QanzBalance {
    user_id: string;
    balance: number;
}

// Notification
export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    reference_type: string | null;
    reference_id: string | null;
    is_read: boolean;
    created_at: string;
}

// QANZ Reward Rule
export interface QanzRewardRule {
    id: string;
    key: string;
    title_en: string;
    title_ar: string;
    amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// QANZ Reward Event
export interface QanzRewardEvent {
    id: string;
    key: string;
    reference_type: string;
    reference_id: string;
    user_id: string;
    issued_amount: number;
    created_at: string;
}

export interface QanzRewardEventWithDetails extends QanzRewardEvent {
    user?: {
        id: string;
        full_name: string | null;
        email?: string;
    };
}
