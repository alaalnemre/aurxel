import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';

export const runtime = 'nodejs';

interface BuyerLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function BuyerLayout({ children, params }: BuyerLayoutProps) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile) {
        redirect(`/${locale}/login`);
    }

    const navItems = [
        { href: `/${locale}/buyer`, label: t('buyer.overview'), icon: 'chart' },
        { href: `/${locale}/buyer/analytics`, label: t('buyer.analytics'), icon: 'analytics' },
        { href: `/${locale}/buyer/favorites`, label: t('buyer.favorites'), icon: 'heart' },
        { href: `/${locale}/buyer/addresses`, label: t('buyer.addresses'), icon: 'location' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <nav className="mb-8 border-b border-border">
                    <div className="flex flex-wrap gap-1 -mb-px">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-primary hover:border-primary border-b-2 border-transparent transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Page Content */}
                {children}
            </div>
        </div>
    );
}
