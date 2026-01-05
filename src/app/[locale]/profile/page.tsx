import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage({
    params,
}: {
    params: { locale: string };
}) {
    const { locale } = params;
    const user = await getCurrentUser();

    if (!user) {
        redirect(`/ ${locale}/login`);
    }

    const supabase = await createClient();

    // Get user's addresses
    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user.profile.full_name}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        defaultValue={user.profile.phone || ''}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue={user.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Email cannot be changed
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Saved Addresses */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Saved Addresses</h2>
                            <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors">
                                + Add New Address
                            </button>
                        </div>

                        {addresses && addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {address.label && (
                                                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                                                            {address.label}
                                                        </span>
                                                    )}
                                                    {address.is_default && (
                                                        <span className="px-2 py-1 bg-success/20 text-success text-xs rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-medium">{address.full_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {address.phone}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {address.address_line1}
                                                    {address.address_line2 && `, ${address.address_line2}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {address.area}, {address.city}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="text-sm text-primary hover:underline">
                                                    Edit
                                                </button>
                                                <button className="text-sm text-error hover:underline">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="mb-2">No saved addresses</p>
                                <p className="text-sm">Add an address to speed up checkout</p>
                            </div>
                        )}
                    </div>

                    {/* Account Settings */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates about your orders
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div>
                                    <p className="font-medium">SMS Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Get delivery updates via SMS
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div>
                                    <p className="font-medium">Marketing Communications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive offers and promotions
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-card border border-error rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-error mb-4">Danger Zone</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="px-6 py-2 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
