import { createClient } from '@/lib/supabase/server';
import { approveVendor } from '@/lib/actions/admin';

export default async function VendorsPage() {
    const supabase = await createClient();

    // Fetch all vendors with user info
    const { data: vendors } = await supabase
        .from('vendors')
        .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        phone
      )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Vendor Management</h2>
                <p className="text-muted-foreground mt-1">
                    Approve and manage vendor accounts
                </p>
            </div>

            {/* Vendors Table */}
            <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Business Name
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Owner
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {vendors && vendors.length > 0 ? (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">{vendor.business_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {vendor.business_address}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full capitalize">
                                                {vendor.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vendor.profiles?.full_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {vendor.business_phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {vendor.is_verified ? (
                                                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                                                        ✓ Verified
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                                {!vendor.is_active && (
                                                    <span className="px-2 py-1 bg-error/20 text-error text-xs rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {!vendor.is_verified && (
                                                    <form action={approveVendor}>
                                                        <input type="hidden" name="vendorId" value={vendor.id} />
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1.5 bg-success text-white text-sm rounded-lg hover:bg-success/90 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    </form>
                                                )}
                                                <button className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No vendors found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Vendors</p>
                    <p className="text-2xl font-bold mt-1">{vendors?.length || 0}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {vendors?.filter((v) => v.is_verified).length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {vendors?.filter((v) => !v.is_verified).length || 0}
                    </p>
                </div>
            </div>
        </div>
    );
}
