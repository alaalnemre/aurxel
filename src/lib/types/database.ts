// ============================================
// Database Types
// ============================================
// Auto-generated types matching Supabase schema

export type UserRole = 'customer' | 'vendor' | 'driver' | 'admin';

export type VendorCategory = 'shop' | 'food' | 'pharmacy' | 'grocery' | 'parcel' | 'rental';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type DeliveryStatus =
    | 'pending'
    | 'assigned'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'failed';

export type PaymentMethod = 'cod' | 'online';

// ============================================
// Table Types
// ============================================

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Vendor {
    id: string;
    user_id: string;
    business_name: string;
    business_name_ar: string | null;
    category: VendorCategory;
    description: string | null;
    description_ar: string | null;
    logo_url: string | null;
    banner_url: string | null;
    commercial_license: string | null;
    tax_number: string | null;
    business_phone: string;
    business_email: string | null;
    business_address: string;
    business_address_ar: string | null;
    latitude: number | null;
    longitude: number | null;
    is_verified: boolean;
    is_active: boolean;
    verified_at: string | null;
    rating_average: number;
    rating_count: number;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    vendor_id: string;
    name: string;
    name_ar: string | null;
    description: string | null;
    description_ar: string | null;
    category: string;
    subcategory: string | null;
    price: number;
    compare_at_price: number | null;
    cost: number | null;
    sku: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    image_url: string | null;
    additional_images: string[] | null;
    is_active: boolean;
    is_featured: boolean;
    slug: string | null;
    rating_average: number;
    rating_count: number;
    created_at: string;
    updated_at: string;
}

export interface Address {
    id: string;
    user_id: string;
    label: string | null;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    area: string | null;
    building_number: string | null;
    floor: string | null;
    apartment: string | null;
    latitude: number | null;
    longitude: number | null;
    delivery_instructions: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    vendor_id: string;
    delivery_address_id: string;
    status: OrderStatus;
    payment_method: PaymentMethod;
    subtotal: number;
    delivery_fee: number;
    tax: number;
    discount: number;
    total: number;
    notes: string | null;
    confirmed_at: string | null;
    preparing_at: string | null;
    ready_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_name_ar: string | null;
    product_image_url: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
    created_at: string;
}

export interface Delivery {
    id: string;
    delivery_number: string;
    order_id: string;
    driver_id: string | null;
    vendor_id: string;
    status: DeliveryStatus;
    pickup_address: string;
    pickup_phone: string;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    delivery_address: string;
    delivery_phone: string;
    delivery_latitude: number | null;
    delivery_longitude: number | null;
    cod_amount: number;
    cod_collected: boolean;
    cod_collected_at: string | null;
    driver_notes: string | null;
    customer_notes: string | null;
    assigned_at: string | null;
    picked_up_at: string | null;
    delivered_at: string | null;
    failed_at: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Extended Types (with relations)
// ============================================

export interface ProductWithVendor extends Product {
    vendor: Vendor;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
    vendor: Vendor;
    delivery_address: Address;
}

export interface DeliveryWithOrder extends Delivery {
    order: OrderWithItems;
    driver: Profile | null;
}

// ============================================
// Form Types
// ============================================

export interface RegisterFormData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: UserRole;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface VendorOnboardingFormData {
    business_name: string;
    business_name_ar?: string;
    category: VendorCategory;
    description?: string;
    description_ar?: string;
    business_phone: string;
    business_email?: string;
    business_address: string;
    business_address_ar?: string;
    commercial_license?: string;
    tax_number?: string;
}

export interface ProductFormData {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    category: string;
    subcategory?: string;
    price: number;
    compare_at_price?: number;
    stock_quantity: number;
    sku?: string;
    image_url?: string;
    is_active: boolean;
    is_featured: boolean;
}
