export default async function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Platform Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Configure global marketplace settings
                </p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Platform Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue="MarketHub"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Support Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue="support@markethub.jo"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Support Phone
                                </label>
                                <input
                                    type="tel"
                                    defaultValue="+962 79 XXX XXXX"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Default Language
                                </label>
                                <select className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="ar">العربية (Arabic)</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Delivery Settings</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Base Delivery Fee (JOD)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    defaultValue="2.00"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Free Delivery Threshold (JOD)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    defaultValue="30.00"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Max Delivery Distance (KM)
                                </label>
                                <input
                                    type="number"
                                    defaultValue="20"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Payment Settings</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    defaultValue="0.00"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Jordan sales tax (currently 0% for most goods)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Currency
                                </label>
                                <select
                                    disabled
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
                                >
                                    <option value="JOD">JOD - Jordanian Dinar (دينار أردني)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Fixed to Jordan currency
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <input
                                type="checkbox"
                                id="cod_enabled"
                                defaultChecked
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="cod_enabled" className="text-sm font-medium cursor-pointer">
                                Enable Cash on Delivery (COD) - Primary payment method in Jordan
                            </label>
                        </div>
                    </div>
                </div>

                {/* Commission Settings */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Commission Settings</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Platform commission rates by vendor category
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    🛍️ Shop (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="10.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    🍔 Food (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="15.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    💊 Pharmacy (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="8.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    🥬 Grocery (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="12.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    📦 Parcel (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="20.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    🚗 Rental (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="18.0"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vendor Approval Settings */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Vendor Management</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <input
                                type="checkbox"
                                id="auto_approve"
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="auto_approve" className="text-sm font-medium cursor-pointer">
                                Auto-approve vendors (disable for manual review)
                            </label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <input
                                type="checkbox"
                                id="require_license"
                                defaultChecked
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="require_license" className="text-sm font-medium cursor-pointer">
                                Require commercial license for vendor registration
                            </label>
                        </div>
                    </div>
                </div>

                {/* System Maintenance */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">System Maintenance</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <input
                                type="checkbox"
                                id="maintenance_mode"
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="maintenance_mode" className="text-sm font-medium cursor-pointer">
                                Enable maintenance mode (site will be unavailable)
                            </label>
                        </div>
                        <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                            <p className="text-sm font-medium text-warning">
                                ⚠️ Note: Settings are currently for display only. Backend integration required for persistence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
                    Save Settings
                </button>
                <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors">
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
}
