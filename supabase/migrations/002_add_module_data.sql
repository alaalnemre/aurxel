-- Add module_data JSONB column for category-specific fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS module_data JSONB;

-- Create index for module_data queries
CREATE INDEX IF NOT EXISTS idx_products_module_data ON products USING GIN (module_data);

-- Add comment explaining the module_data structure
COMMENT ON COLUMN products.module_data IS 'Category-specific data stored as JSONB. Structure varies by vendor category:
- food: preparation_time, dietary_info, spice_level, allergens, cuisine_type, serves
- pharmacy: requires_prescription, drug_category, dosage_form, strength, active_ingredient, manufacturer
- grocery: unit_type, min_order_quantity, expiry_date, organic, origin_country
- parcel: weight_kg, dimensions, fragile, insurance_value
- rental: rental_type, hourly_rate, daily_rate, weekly_rate, monthly_rate, deposit_required, min_rental_period, max_rental_period, rental_terms, pickup_required, delivery_available';
