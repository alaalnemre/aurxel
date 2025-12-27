'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import {
    ShoppingCart,
    Package,
    Wallet,
    Truck,
    Users,
    Store,
    Settings,
    ClipboardList,
    DollarSign,
    LayoutDashboard,
    Bike,
    Gem,
    ShoppingBag,
    Menu,
    X,
    Home,
    User,
    LogOut,
} from 'lucide-react';
import { useState, type ReactNode, type ElementType } from 'react';
import { signOut } from '@/lib/actions/auth';

// Icon mapping for navigation items
const iconComponents: Record<string, ElementType> = {
    home: Home,
    dashboard: LayoutDashboard,
    cart: ShoppingCart,
    orders: Package,
    wallet: Wallet,
    shop: ShoppingBag,
    products: Package,
    settings: Settings,
    users: Users,
    store: Store,
    sellers: Store,
    drivers: Bike,
    truck: Truck,
    deliveries: Truck,
    earnings: DollarSign,
    payouts: DollarSign,
    qanz: Gem,
    clipboard: ClipboardList,
    user: User,
    logout: LogOut,
};

interface NavigationItem {
    href: string;
    label: string;
    icon: string; // icon key
}

// ============================================
// HEADER COMPONENT
// ============================================
export function Header({ cartCount = 0 }: { cartCount?: number }) {
    const params = useParams();
    const locale = params.locale as string;
    const isRTL = locale === 'ar';

    return (
        <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent flex items-center justify-center">
                            <span className="text-white font-bold text-lg">J</span>
                        </div>
                        <span className="font-bold text-base sm:text-lg hidden sm:inline">JordanMarket</span>
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <ThemeToggle />
                        <LanguageToggle />

                        {/* Cart */}
                        <Link
                            href={`/${locale}/cart`}
                            className="relative p-2 hover:bg-bg-muted rounded-lg transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-medium rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        <Link
                            href={`/${locale}/login`}
                            className="p-2 hover:bg-bg-muted rounded-lg transition-colors"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

// ============================================
// DASHBOARD SIDEBAR
// ============================================
interface DashboardSidebarProps {
    role: 'buyer' | 'seller' | 'driver' | 'admin';
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const isRTL = locale === 'ar';

    const navItems = getNavItems(role, locale, isRTL);

    return (
        <aside className={`hidden lg:flex flex-col w-64 bg-bg-secondary border-${isRTL ? 'l' : 'r'} border-border min-h-screen sticky top-0`}>
            {/* Logo */}
            <div className="p-4 border-b border-border">
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                        <span className="text-white font-bold text-lg">J</span>
                    </div>
                    <span className="font-bold">JordanMarket</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const IconComponent = iconComponents[item.icon] || Package;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent text-white'
                                : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
                                }`}
                        >
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageToggle />
                </div>
                <form action={signOut.bind(null, locale)}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-muted hover:text-danger transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

// ============================================
// MOBILE NAVIGATION
// ============================================
export function MobileNav({ role }: DashboardSidebarProps) {
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const isRTL = locale === 'ar';

    const mobileItems = getMobileNavItems(role, locale, isRTL);

    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-primary border-t border-border safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {mobileItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const IconComponent = iconComponents[item.icon] || Package;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-lg transition-colors ${isActive ? 'text-accent' : 'text-text-muted'
                                }`}
                        >
                            <IconComponent className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// ============================================
// NAVIGATION ITEMS
// ============================================
function getNavItems(role: string, locale: string, isRTL: boolean): NavigationItem[] {
    switch (role) {
        case 'buyer':
            return [
                { href: `/${locale}/buyer`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: 'dashboard' },
                { href: `/${locale}/buyer/orders`, label: isRTL ? 'طلباتي' : 'My Orders', icon: 'orders' },
                { href: `/${locale}/buyer/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: 'qanz' },
                { href: `/${locale}/products`, label: isRTL ? 'تسوق' : 'Shop', icon: 'shop' },
                { href: `/${locale}/cart`, label: isRTL ? 'السلة' : 'Cart', icon: 'cart' },
            ];
        case 'seller':
            return [
                { href: `/${locale}/seller`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: 'dashboard' },
                { href: `/${locale}/seller/products`, label: isRTL ? 'المنتجات' : 'Products', icon: 'products' },
                { href: `/${locale}/seller/orders`, label: isRTL ? 'الطلبات' : 'Orders', icon: 'clipboard' },
                { href: `/${locale}/seller/payouts`, label: isRTL ? 'الأرباح' : 'Payouts', icon: 'payouts' },
                { href: `/${locale}/seller/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: 'qanz' },
                { href: `/${locale}/seller/settings`, label: isRTL ? 'الإعدادات' : 'Settings', icon: 'settings' },
            ];
        case 'driver':
            return [
                { href: `/${locale}/driver`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: 'dashboard' },
                { href: `/${locale}/driver/deliveries`, label: isRTL ? 'التوصيلات' : 'Deliveries', icon: 'truck' },
                { href: `/${locale}/driver/earnings`, label: isRTL ? 'الأرباح' : 'Earnings', icon: 'earnings' },
                { href: `/${locale}/driver/wallet`, label: isRTL ? 'المحفظة' : 'Wallet', icon: 'qanz' },
            ];
        case 'admin':
            return [
                { href: `/${locale}/admin`, label: isRTL ? 'الرئيسية' : 'Dashboard', icon: 'dashboard' },
                { href: `/${locale}/admin/users`, label: isRTL ? 'المستخدمين' : 'Users', icon: 'users' },
                { href: `/${locale}/admin/sellers`, label: isRTL ? 'البائعين' : 'Sellers', icon: 'store' },
                { href: `/${locale}/admin/drivers`, label: isRTL ? 'السائقين' : 'Drivers', icon: 'drivers' },
                { href: `/${locale}/admin/orders`, label: isRTL ? 'الطلبات' : 'Orders', icon: 'orders' },
                { href: `/${locale}/admin/qanz`, label: 'QANZ', icon: 'qanz' },
            ];
        default:
            return [];
    }
}

function getMobileNavItems(role: string, locale: string, isRTL: boolean): NavigationItem[] {
    switch (role) {
        case 'buyer':
            return [
                { href: `/${locale}/products`, icon: 'shop', label: isRTL ? 'تسوق' : 'Shop' },
                { href: `/${locale}/cart`, icon: 'cart', label: isRTL ? 'السلة' : 'Cart' },
                { href: `/${locale}/buyer`, icon: 'home', label: isRTL ? 'الرئيسية' : 'Home' },
                { href: `/${locale}/buyer/orders`, icon: 'orders', label: isRTL ? 'طلباتي' : 'Orders' },
                { href: `/${locale}/buyer/wallet`, icon: 'qanz', label: 'QANZ' },
            ];
        case 'seller':
            return [
                { href: `/${locale}/seller`, icon: 'home', label: isRTL ? 'الرئيسية' : 'Home' },
                { href: `/${locale}/seller/products`, icon: 'products', label: isRTL ? 'المنتجات' : 'Products' },
                { href: `/${locale}/seller/orders`, icon: 'clipboard', label: isRTL ? 'الطلبات' : 'Orders' },
                { href: `/${locale}/seller/payouts`, icon: 'payouts', label: isRTL ? 'الأرباح' : 'Payouts' },
            ];
        case 'driver':
            return [
                { href: `/${locale}/driver`, icon: 'home', label: isRTL ? 'الرئيسية' : 'Home' },
                { href: `/${locale}/driver/deliveries`, icon: 'truck', label: isRTL ? 'توصيلات' : 'Deliver' },
                { href: `/${locale}/driver/earnings`, icon: 'earnings', label: isRTL ? 'الأرباح' : 'Earnings' },
            ];
        case 'admin':
            return [
                { href: `/${locale}/admin`, icon: 'home', label: isRTL ? 'الرئيسية' : 'Home' },
                { href: `/${locale}/admin/users`, icon: 'users', label: isRTL ? 'مستخدمين' : 'Users' },
                { href: `/${locale}/admin/orders`, icon: 'orders', label: isRTL ? 'طلبات' : 'Orders' },
                { href: `/${locale}/admin/qanz`, icon: 'qanz', label: 'QANZ' },
            ];
        default:
            return [];
    }
}
