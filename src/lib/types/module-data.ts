export interface ModuleData {
    // Food Module
    preparation_time?: number; // minutes
    dietary_info?: string[]; // ['vegetarian', 'vegan', 'gluten-free']
    spice_level?: 'mild' | 'medium' | 'hot';
    allergens?: string[];
    cuisine_type?: string;
    serves?: number;

    // Pharmacy Module
    requires_prescription?: boolean;
    drug_category?: string;
    dosage_form?: 'tablets' | 'capsules' | 'syrup' | 'injection' | 'cream' | 'other';
    strength?: string; // e.g., "500mg"
    active_ingredient?: string;
    manufacturer?: string;

    // Grocery Module
    unit_type?: 'kg' | 'liter' | 'piece';
    min_order_quantity?: number;
    expiry_date?: string;
    organic?: boolean;
    origin_country?: string;

    // Parcel Module
    weight_kg?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    fragile?: boolean;
    insurance_value?: number;

    // Rental Module
    rental_type?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    hourly_rate?: number;
    daily_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    deposit_required?: number;
    min_rental_period?: number; // in hours or days
    max_rental_period?: number;
    availability_calendar?: string[]; // ISO date strings of unavailable dates
    rental_terms?: string; // Terms and conditions
    pickup_required?: boolean;
    delivery_available?: boolean;
}
