'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

interface NavItem {
    href: string;
    label: string;
    icon?: string;
}

export function Header({
    locale,
    user,
    navItems = [],
}: {
    locale: string;
    user?: { name?: string; avatar?: string } | null;
    navItems?: NavItem[];
}) {
    const isRTL = locale === 'ar';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="container-wide flex h-16 items-center justify-between">
                {/* Logo */}
                <Link
                    href={`/${locale}`}
                    className="flex items-center gap-2 font-bold text-lg"
                >
                    <span className="text-2xl">🛒</span>
                    <span className="gradient-text hidden sm:inline">
                        JordanMarket
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="nav-item"
                        >
                            {item.icon && <span>{item.icon}</span>}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <ThemeToggle locale={locale} />
                    <LanguageToggle locale={locale} />

                    {user ? (
                        <Link
                            href={`/${locale}/buyer`}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
                        >
                            <span>{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
                        </Link>
                    ) : (
                        <Link
                            href={`/${locale}/login`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white font-medium hover:shadow-glow transition-all"
                        >
                            <span>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export function DashboardSidebar({
    locale,
    role,
    currentPath,
}: {
    locale: string;
    role: 'buyer' | 'seller' | 'driver' | 'admin';
    currentPath: string;
}) {
    const isRTL = locale === 'ar';

    const navItems: Record<string, NavItem[]> = {
        buyer: [
            { href: `/${locale}/buyer`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: '🏠' },
            { href: `/${locale}/buyer/orders`, label: isRTL ? 'طلباتي' : 'My Orders', icon: '📦' },
            { href: `/${locale}/buyer/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: '💎' },
            { href: `/${locale}/products`, label: isRTL ? 'تسوق' : 'Shop', icon: '🛍️' },
            { href: `/${locale}/cart`, label: isRTL ? 'السلة' : 'Cart', icon: '🛒' },
        ],
        seller: [
            { href: `/${locale}/seller`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: '🏠' },
            { href: `/${locale}/seller/products`, label: isRTL ? 'المنتجات' : 'Products', icon: '📦' },
            { href: `/${locale}/seller/orders`, label: isRTL ? 'الطلبات' : 'Orders', icon: '📋' },
            { href: `/${locale}/seller/payouts`, label: isRTL ? 'الأرباح' : 'Payouts', icon: '💰' },
            { href: `/${locale}/seller/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: '💎' },
            { href: `/${locale}/seller/settings`, label: isRTL ? 'الإعدادات' : 'Settings', icon: '⚙️' },
        ],
        driver: [
            { href: `/${locale}/driver`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: '🏠' },
            { href: `/${locale}/driver/deliveries`, label: isRTL ? 'التوصيلات' : 'Deliveries', icon: '🚚' },
            { href: `/${locale}/driver/earnings`, label: isRTL ? 'الأرباح' : 'Earnings', icon: '💰' },
            { href: `/${locale}/driver/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: '💎' },
        ],
        admin: [
            { href: `/${locale}/admin`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: '🏠' },
            { href: `/${locale}/admin/users`, label: isRTL ? 'المستخدمين' : 'Users', icon: '👥' },
            { href: `/${locale}/admin/sellers`, label: isRTL ? 'البائعين' : 'Sellers', icon: '🏪' },
            { href: `/${locale}/admin/drivers`, label: isRTL ? 'السائقين' : 'Drivers', icon: '🚗' },
            { href: `/${locale}/admin/orders`, label: isRTL ? 'الطلبات' : 'Orders', icon: '📦' },
            { href: `/${locale}/admin/qanz`, label: 'QANZ', icon: '💎' },
        ],
    };

    const items = navItems[role] || [];

    return (
        <aside className="w-64 min-h-screen border-r border-border bg-card p-4 hidden lg:block">
            <div className="sticky top-20">
                <nav className="space-y-1">
                    {items.map((item) => {
                        const isActive = currentPath === item.href ||
                            (item.href !== `/${locale}/${role}` && currentPath.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

export function MobileNav({
    locale,
    role,
}: {
    locale: string;
    role: 'buyer' | 'seller' | 'driver' | 'admin';
}) {
    const isRTL = locale === 'ar';

    const navItems: Record<string, { href: string; icon: string; label: string }[]> = {
        buyer: [
            { href: `/${locale}/buyer`, icon: '🏠', label: isRTL ? 'الرئيسية' : 'Home' },
            { href: `/${locale}/products`, icon: '🛍️', label: isRTL ? 'تسوق' : 'Shop' },
            { href: `/${locale}/cart`, icon: '🛒', label: isRTL ? 'السلة' : 'Cart' },
            { href: `/${locale}/buyer/orders`, icon: '📦', label: isRTL ? 'طلباتي' : 'Orders' },
            { href: `/${locale}/buyer/wallet`, icon: '💎', label: 'QANZ' },
        ],
        seller: [
            { href: `/${locale}/seller`, icon: '🏠', label: isRTL ? 'الرئيسية' : 'Home' },
            { href: `/${locale}/seller/products`, icon: '📦', label: isRTL ? 'المنتجات' : 'Products' },
            { href: `/${locale}/seller/orders`, icon: '📋', label: isRTL ? 'الطلبات' : 'Orders' },
            { href: `/${locale}/seller/payouts`, icon: '💰', label: isRTL ? 'الأرباح' : 'Payouts' },
        ],
        driver: [
            { href: `/${locale}/driver`, icon: '🏠', label: isRTL ? 'الرئيسية' : 'Home' },
            { href: `/${locale}/driver/deliveries`, icon: '🚚', label: isRTL ? 'توصيلات' : 'Deliver' },
            { href: `/${locale}/driver/earnings`, icon: '💰', label: isRTL ? 'الأرباح' : 'Earnings' },
        ],
        admin: [
            { href: `/${locale}/admin`, icon: '🏠', label: isRTL ? 'الرئيسية' : 'Home' },
            { href: `/${locale}/admin/users`, icon: '👥', label: isRTL ? 'مستخدمين' : 'Users' },
            { href: `/${locale}/admin/orders`, icon: '📦', label: isRTL ? 'طلبات' : 'Orders' },
            { href: `/${locale}/admin/qanz`, icon: '💎', label: 'QANZ' },
        ],
    };

    const items = navItems[role] || [];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
            <div className="flex items-center justify-around py-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
