// Database types for JordanMarket
// Using capability flags instead of single role

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

export type DisputeStatus =
    | 'open'
    | 'under_review'
    | 'resolved'
    | 'closed';

export type TransactionType = 'topup' | 'payment' | 'refund' | 'payout';

export interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    // Capability flags
    is_buyer: boolean;
    is_seller: boolean;
    is_driver: boolean;
    is_admin: boolean;
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
    is_sponsored: boolean;
    sponsored_until: string | null;
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
    // Monetization fields (set on completion)
    platform_fee: number | null;
    seller_payout: number | null;
    platform_fee_rate: number | null;
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
    tip_amount: number;
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
    type: TransactionType;
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

export interface Dispute {
    id: string;
    order_id: string;
    raised_by: string;
    assigned_to: string | null;
    status: DisputeStatus;
    reason: string;
    resolution: string | null;
    created_at: string;
    updated_at: string;
}

// Utility type for profile with expanded relations
export interface ProfileWithDetails extends Profile {
    seller_profile?: SellerProfile | null;
    driver_profile?: DriverProfile | null;
    wallet?: Wallet | null;
}

// Type for capability flags only
export type Capabilities = Pick<Profile, 'is_buyer' | 'is_seller' | 'is_driver' | 'is_admin'>;

// Helper function to get primary dashboard route based on capabilities
export function getPrimaryDashboard(capabilities: Capabilities): string {
    // Priority: admin > seller > driver > buyer
    if (capabilities.is_admin) return 'admin';
    if (capabilities.is_seller) return 'seller';
    if (capabilities.is_driver) return 'driver';
    return 'buyer';
}

// Helper function to check if user has capability for a route
export function hasCapabilityForRoute(capabilities: Capabilities, route: string): boolean {
    switch (route) {
        case 'admin':
            return capabilities.is_admin;
        case 'seller':
            return capabilities.is_seller;
        case 'driver':
            return capabilities.is_driver;
        case 'buyer':
            return capabilities.is_buyer;
        default:
            return true; // Public routes
    }
}
