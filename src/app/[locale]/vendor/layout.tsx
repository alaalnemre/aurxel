import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function VendorLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUser();

    // Check if user is authenticated and is vendor
    if (!user || user.profile.role !== 'vendor') {
        redirect(`/${locale}/login`);
    }

    // Check if vendor has completed onboarding
    const supabase = await createClient();
    const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    // If no vendor profile exists, redirect to onboarding
    if (!vendor) {
        redirect(`/${locale}/vendor/onboarding`);
    }

    return (
        <div className="min-h-screen bg-muted" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Vendor Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-primary">
                            {vendor.business_name}
                        </h1>
                        {vendor.is_verified && (
                            <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                                ✓ Verified
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {user.profile.full_name}
                        </span>
                        <Link
                            href={`/${locale}`}
                            className="text-sm text-primary hover:underline"
                        >
                            ← View Storefront
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="bg-card rounded-lg p-4 space-y-2">
                            <NavLink href={`/${locale}/vendor`} icon="📊">
                                Dashboard
                            </NavLink>
                            <NavLink href={`/${locale}/vendor/products`} icon="📦">
                                Products
                            </NavLink>
                            <NavLink href={`/${locale}/vendor/products/new`} icon="➕">
                                Add Product
                            </NavLink>
                            <NavLink href={`/${locale}/vendor/orders`} icon="🛒">
                                Orders
                            </NavLink>
                            <NavLink href={`/${locale}/vendor/settings`} icon="⚙️">
                                Settings
                            </NavLink>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-card rounded-lg p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

function NavLink({
    href,
    icon,
    children,
}: {
    href: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-primary-light hover:text-primary transition-colors"
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{children}</span>
        </Link>
    );
}
