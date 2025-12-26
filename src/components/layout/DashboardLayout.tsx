'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from '@/lib/actions/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'buyer' | 'seller' | 'driver' | 'admin';
    userName?: string | null;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const t = useTranslations(role);
    const tNav = useTranslations('nav');
    const tCommon = useTranslations('common');

    const navItems = getNavItems(role, locale, t);

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Top Header */}
            <header className="bg-card border-b border-border sticky top-0 z-50">
                <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/${locale}`} className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold">J</span>
                            </div>
                            <span className="font-bold text-lg hidden sm:block">{tCommon('appName')}</span>
                        </Link>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-sm font-medium capitalize">{t('dashboard')}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Switcher */}
                        <Link
                            href={pathname.replace(`/${locale}`, `/${locale === 'ar' ? 'en' : 'ar'}`)}
                            className="text-sm text-secondary hover:text-foreground"
                        >
                            {locale === 'ar' ? 'EN' : 'عربي'}
                        </Link>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                    {userName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                            <form action={() => signOut(locale)}>
                                <button
                                    type="submit"
                                    className="text-sm text-secondary hover:text-error transition-colors"
                                >
                                    {tNav('logout')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] hidden lg:block">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-secondary hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
                    <div className="flex justify-around py-2">
                        {navItems.slice(0, 5).map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 ${isActive ? 'text-primary' : 'text-secondary'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-xs">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function getNavItems(role: string, locale: string, t: (key: string) => string) {
    const base = `/${locale}/${role}`;

    const items: Record<string, { href: string; icon: string; label: string }[]> = {
        buyer: [
            { href: base, icon: '🏠', label: t('dashboard') },
            { href: `${base}/orders`, icon: '📦', label: t('myOrders') },
            { href: `${base}/wallet`, icon: '💳', label: t('wallet') },
            { href: `/${locale}/products`, icon: '🛍️', label: 'Products' },
        ],
        seller: [
            { href: base, icon: '📊', label: t('dashboard') },
            { href: `${base}/products`, icon: '📦', label: t('products') },
            { href: `${base}/orders`, icon: '🛒', label: t('orders') },
            { href: `${base}/payouts`, icon: '💰', label: t('payouts') },
            { href: `${base}/settings`, icon: '⚙️', label: t('settings') },
        ],
        driver: [
            { href: base, icon: '🏠', label: t('dashboard') },
            { href: `${base}/deliveries`, icon: '🚚', label: t('availableDeliveries') },
            { href: `${base}/earnings`, icon: '💰', label: t('earnings') },
        ],
        admin: [
            { href: base, icon: '📊', label: t('dashboard') },
            { href: `${base}/users`, icon: '👥', label: t('users') },
            { href: `${base}/sellers`, icon: '🏪', label: t('sellers') },
            { href: `${base}/drivers`, icon: '🛵', label: t('drivers') },
            { href: `${base}/orders`, icon: '📦', label: t('orders') },
            { href: `${base}/qanz`, icon: '💎', label: t('qanz') },
        ],
    };

    return items[role] || [];
}
