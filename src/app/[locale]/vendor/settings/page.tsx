import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function VendorSettingsPage() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get vendor info
    const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user!.id)
        .single();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Store Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your store profile and preferences
                </p>
            </div>

            {/* Verification Status */}
            {vendor.is_verified ? (
                <div className="bg-success/10 border border-success rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <h3 className="font-semibold text-success">Store Verified</h3>
                        <p className="text-sm text-muted-foreground">
                            Your store is verified and visible to customers
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-warning/10 border border-warning rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                        <h3 className="font-semibold text-warning">Pending Verification</h3>
                        <p className="text-sm text-muted-foreground">
                            Your store is under review by our team
                        </p>
                    </div>
                </div>
            )}

            {/* Settings Form */}
            <form className="space-y-6">
                {/* Business Information */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Business Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={vendor.business_name}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Business Name (Arabic)
                                </label>
                                <input
                                    type="text"
                                    defaultValue={vendor.business_name_ar || ''}
                                    dir="rtl"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Category
                                </label>
                                <select
                                    defaultValue={vendor.category}
                                    disabled
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed capitalize"
                                >
                                    <option value={vendor.category}>{vendor.category}</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Contact support to change category
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Store Status
                                </label>
                                <select
                                    defaultValue={vendor.is_active ? 'active' : 'inactive'}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="active">Active (Accepting Orders)</option>
                                    <option value="inactive">Inactive (Temporarily Closed)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    defaultValue={vendor.description || ''}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Tell customers about your business..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description (Arabic)
                                </label>
                                <textarea
                                    defaultValue={vendor.description_ar || ''}
                                    rows={3}
                                    dir="rtl"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="وصف عملك بالعربية..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Branding</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    defaultValue={vendor.logo_url || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/logo.png"
                                />
                                {vendor.logo_url && (
                                    <div className="mt-2 w-24 h-24 border border-border rounded-lg overflow-hidden">
                                        <img
                                            src={vendor.logo_url}
                                            alt="Store logo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Banner URL
                                </label>
                                <input
                                    type="url"
                                    defaultValue={vendor.banner_url || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/banner.jpg"
                                />
                                {vendor.banner_url && (
                                    <div className="mt-2 w-full h-24 border border-border rounded-lg overflow-hidden">
                                        <img
                                            src={vendor.banner_url}
                                            alt="Store banner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Business Phone
                                </label>
                                <input
                                    type="tel"
                                    defaultValue={vendor.business_phone}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Business Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue={vendor.business_email || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Address */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Business Address</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Address
                                </label>
                                <textarea
                                    defaultValue={vendor.business_address}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Address (Arabic)
                                </label>
                                <textarea
                                    defaultValue={vendor.business_address_ar || ''}
                                    rows={2}
                                    dir="rtl"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Latitude (for delivery zone)
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    defaultValue={vendor.latitude || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="31.9454"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Longitude (for delivery zone)
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    defaultValue={vendor.longitude || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="35.9284"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal Documents */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Legal Documents</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Commercial License Number
                                </label>
                                <input
                                    type="text"
                                    defaultValue={vendor.commercial_license || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tax Number
                                </label>
                                <input
                                    type="text"
                                    defaultValue={vendor.tax_number || ''}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Rating */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Store Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {vendor.rating_average.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-white/80">★★★★★</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                <p className="text-lg font-semibold">
                                    {vendor.rating_count} reviews
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg text-3xl">
                                {vendor.is_verified ? '✓' : '⏳'}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Verification Status</p>
                                <p className="text-lg font-semibold">
                                    {vendor.is_verified ? 'Verified Store' : 'Under Review'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                    <p className="text-sm font-medium text-warning">
                        ⚠️ Note: Settings are currently for display only. Backend integration required for persistence.
                    </p>
                </div>
            </form>
        </div>
    );
}
