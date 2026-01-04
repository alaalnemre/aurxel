export function RentalProductFields() {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🚗</span>
                <h4 className="text-xl font-semibold text-purple-900">Rental-Specific Information</h4>
            </div>

            {/* Rental Type */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Rental Type *
                </label>
                <select
                    name="module_data.rental_type"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Select rental type</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            {/* Pricing Grid */}
            <div>
                <label className="block text-sm font-medium mb-3">
                    Rental Rates (JOD)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Hourly Rate
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="module_data.hourly_rate"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="5.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Daily Rate
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="module_data.daily_rate"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="30.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Weekly Rate
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="module_data.weekly_rate"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="150.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Monthly Rate
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="module_data.monthly_rate"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="500.00"
                        />
                    </div>
                </div>
            </div>

            {/* Deposit and Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Security Deposit (JOD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="module_data.deposit_required"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="50.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Min Rental Period (days)
                    </label>
                    <input
                        type="number"
                        name="module_data.min_rental_period"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Max Rental Period (days)
                    </label>
                    <input
                        type="number"
                        name="module_data.max_rental_period"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="30"
                    />
                </div>
            </div>

            {/* Rental Terms */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Rental Terms & Conditions
                </label>
                <textarea
                    name="module_data.rental_terms"
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Valid driver's license required, fuel not included, late return fees apply..."
                />
            </div>

            {/* Service Options */}
            <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">
                    Service Options
                </label>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                        <input
                            type="checkbox"
                            name="module_data.pickup_required"
                            className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <div>
                            <p className="font-medium">Customer Pickup Required</p>
                            <p className="text-xs text-muted-foreground">
                                Customer must pick up the item from your location
                            </p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                        <input
                            type="checkbox"
                            name="module_data.delivery_available"
                            className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <div>
                            <p className="font-medium">Delivery Available</p>
                            <p className="text-xs text-muted-foreground">
                                You can deliver the item to customer's location
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <span className="text-xl">💡</span>
                    <div className="text-sm text-purple-900">
                        <p className="font-semibold mb-1">Rental Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-purple-800">
                            <li>Set competitive rates based on market demand</li>
                            <li>Clearly define rental terms to avoid disputes</li>
                            <li>Consider offering discounts for longer rental periods</li>
                            <li>Security deposit helps protect your asset</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
