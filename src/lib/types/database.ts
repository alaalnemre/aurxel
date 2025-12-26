export type UserRole = 'buyer' | 'seller' | 'driver' | 'admin';

export type OrderStatus =
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'assigned'
    | 'picked_up'
    | 'delivered'
    | 'cancelled';

export type DeliveryStatus =
    | 'available'
    | 'assigned'
    | 'picked_up'
    | 'delivered'
    | 'cancelled';

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
    business_name: string;
    business_address: string | null;
    business_description_en: string | null;
    business_description_ar: string | null;
    logo_url: string | null;
    banner_url: string | null;
    verification_docs: string[] | null;
    is_verified: boolean;
    created_at: string;
}

export interface DriverProfile {
    id: string;
    id_document_url: string | null;
    vehicle_type: string | null;
    vehicle_plate: string | null;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    parent_id: string | null;
    image_url: string | null;
    is_active: boolean;
}

export interface Product {
    id: string;
    seller_id: string;
    category_id: string | null;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    price: number;
    compare_at_price: number | null;
    stock: number;
    images: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    status: OrderStatus;
    total_amount: number;
    delivery_fee: number;
    delivery_address: string;
    delivery_phone: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
}

export interface Delivery {
    id: string;
    order_id: string;
    driver_id: string | null;
    status: DeliveryStatus;
    picked_up_at: string | null;
    delivered_at: string | null;
    cash_collected: number | null;
    created_at: string;
}

export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

export interface TopupCode {
    id: string;
    code: string;
    amount: number;
    created_by: string;
    redeemed_by: string | null;
    redeemed_at: string | null;
    created_at: string;
}

export interface WalletTransaction {
    id: string;
    wallet_id: string;
    type: 'topup' | 'payment' | 'refund' | 'payout';
    amount: number;
    reference_id: string | null;
    description: string | null;
    created_at: string;
}

export interface Review {
    id: string;
    order_id: string;
    reviewer_id: string;
    target_id: string;
    target_type: 'seller' | 'driver';
    rating: number;
    comment: string | null;
    created_at: string;
}
