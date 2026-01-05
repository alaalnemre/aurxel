import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { createVendor } from '@/lib/actions/vendor';

export default async function VendorOnboarding({
    params,
}: {
    params: { locale: string };
}) {
    const { locale } = params;
    const user = await getCurrentUser();

    if (!user || user.profile.role !== 'vendor') {
        redirect(`/${locale}/login`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        Welcome to MarketHub Vendors! 🏪
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Let's set up your business profile to start selling
                    </p>
                </div>

                {/* Onboarding Form */}
                <form action={createVendor} className="space-y-6">
                    {/* Business Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="business_name"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Your Store Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Name (Arabic)
                            </label>
                            <input
                                type="text"
                                name="business_name_ar"
                                dir="rtl"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="اسم المتجر بالعربية"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Business Category *
                        </label>
                        <select
                            name="category"
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Select Category</option>
                            <option value="shop">🛍️ Shop (General Products)</option>
                            <option value="food">🍔 Food & Restaurants</option>
                            <option value="pharmacy">💊 Pharmacy & Health</option>
                            <option value="grocery">🥬 Grocery & Supermarket</option>
                            <option value="parcel">📦 Parcel & Logistics</option>
                            <option value="rental">🚗 Rental Services</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
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
                                name="description_ar"
                                rows={3}
                                dir="rtl"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="وصف عملك بالعربية..."
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Phone *
                            </label>
                            <input
                                type="tel"
                                name="business_phone"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="+962 7X XXX XXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Email
                            </label>
                            <input
                                type="email"
                                name="business_email"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="contact@yourbusiness.com"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Address *
                            </label>
                            <textarea
                                name="business_address"
                                required
                                rows={2}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Street, Area, City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Business Address (Arabic)
                            </label>
                            <textarea
                                name="business_address_ar"
                                rows={2}
                                dir="rtl"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="الشارع، المنطقة، المدينة"
                            />
                        </div>
                    </div>

                    {/* License Info (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Commercial License Number
                            </label>
                            <input
                                type="text"
                                name="commercial_license"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tax Number
                            </label>
                            <input
                                type="text"
                                name="tax_number"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                        >
                            Complete Registration & Start Selling 🚀
                        </button>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        Your account will be reviewed by our team within 24-48 hours
                    </p>
                </form>
            </div>
        </div>
    );
}
