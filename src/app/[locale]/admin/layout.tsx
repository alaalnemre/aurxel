import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUser();

    // Check if user is authenticated and is admin
    if (!user || user.profile.role !== 'admin') {
        redirect(`/${locale}/login`);
    }

    const t = await getTranslations('admin');

    return (
        <div className="min-h-screen bg-muted" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Admin Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">
                        {t('dashboard')}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {user.profile.full_name}
                        </span>
                        <Link
                            href={`/${locale}`}
                            className="text-sm text-primary hover:underline"
                        >
                            ← Back to Site
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="bg-card rounded-lg p-4 space-y-2">
                            <NavLink href={`/${locale}/admin`} icon="📊">
                                Dashboard
                            </NavLink>
                            <NavLink href={`/${locale}/admin/vendors`} icon="🏪">
                                Vendors
                            </NavLink>
                            <NavLink href={`/${locale}/admin/products`} icon="📦">
                                Products
                            </NavLink>
                            <NavLink href={`/${locale}/admin/orders`} icon="🛒">
                                Orders
                            </NavLink>
                            <NavLink href={`/${locale}/admin/drivers`} icon="🚚">
                                Drivers
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
