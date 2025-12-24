'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Home,
    ShoppingCart,
    Package,
    Truck,
    Users,
    Settings,
    CreditCard,
    FileText,
    BarChart3,
    Menu,
    Store,
    ClipboardList,
    Wallet,
    Shield,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

interface SidebarProps {
    items: NavItem[];
    locale: string;
}

export function Sidebar({ items, locale }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    const NavLinks = () => (
        <nav className="flex flex-col gap-1 p-2">
            {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        ) : null}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Mobile sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden fixed top-3 left-3 z-40"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-64 p-0">
                    <div className="flex h-14 items-center border-b px-4">
                        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold">
                            <Store className="h-5 w-5" />
                            <span>JordanMarket</span>
                        </Link>
                    </div>
                    <ScrollArea className="h-[calc(100vh-3.5rem)]">
                        <NavLinks />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card fixed left-0 top-0">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold">
                        <Store className="h-5 w-5" />
                        <span>JordanMarket</span>
                    </Link>
                </div>
                <ScrollArea className="flex-1">
                    <NavLinks />
                </ScrollArea>
            </aside>
        </>
    );
}

// Pre-defined navigation items for each role
export const buyerNavItems = (locale: string): NavItem[] => [
    { title: locale === 'ar' ? 'الرئيسية' : 'Home', href: `/${locale}/buyer`, icon: Home },
    { title: locale === 'ar' ? 'المتجر' : 'Shop', href: `/${locale}/buyer/shop`, icon: ShoppingCart },
    { title: locale === 'ar' ? 'طلباتي' : 'My Orders', href: `/${locale}/buyer/orders`, icon: Package },
    { title: locale === 'ar' ? 'المحفظة' : 'Wallet', href: `/${locale}/buyer/wallet`, icon: Wallet },
    { title: locale === 'ar' ? 'الدعم' : 'Support', href: `/${locale}/buyer/support`, icon: FileText },
    { title: locale === 'ar' ? 'الإعدادات' : 'Settings', href: `/${locale}/buyer/settings`, icon: Settings },
];

export const sellerNavItems = (locale: string): NavItem[] => [
    { title: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: `/${locale}/seller`, icon: Home },
    { title: locale === 'ar' ? 'المنتجات' : 'Products', href: `/${locale}/seller/products`, icon: Package },
    { title: locale === 'ar' ? 'الطلبات' : 'Orders', href: `/${locale}/seller/orders`, icon: ClipboardList },
    { title: locale === 'ar' ? 'التحليلات' : 'Analytics', href: `/${locale}/seller/analytics`, icon: BarChart3 },
    { title: locale === 'ar' ? 'المدفوعات' : 'Payouts', href: `/${locale}/seller/payouts`, icon: CreditCard },
    { title: locale === 'ar' ? 'المتجر' : 'Store Profile', href: `/${locale}/seller/store`, icon: Store },
    { title: locale === 'ar' ? 'الإعدادات' : 'Settings', href: `/${locale}/seller/settings`, icon: Settings },
];

export const driverNavItems = (locale: string): NavItem[] => [
    { title: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: `/${locale}/driver`, icon: Home },
    { title: locale === 'ar' ? 'التوصيلات المتاحة' : 'Available', href: `/${locale}/driver/available`, icon: Package },
    { title: locale === 'ar' ? 'توصيلاتي' : 'My Deliveries', href: `/${locale}/driver/deliveries`, icon: Truck },
    { title: locale === 'ar' ? 'الأرباح' : 'Earnings', href: `/${locale}/driver/earnings`, icon: Wallet },
    { title: locale === 'ar' ? 'الإعدادات' : 'Settings', href: `/${locale}/driver/settings`, icon: Settings },
];

export const adminNavItems = (locale: string): NavItem[] => [
    { title: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: `/${locale}/admin`, icon: Home },
    { title: locale === 'ar' ? 'الموافقات' : 'Approvals', href: `/${locale}/admin/approvals`, icon: Shield },
    { title: locale === 'ar' ? 'المستخدمين' : 'Users', href: `/${locale}/admin/users`, icon: Users },
    { title: locale === 'ar' ? 'الطلبات' : 'Orders', href: `/${locale}/admin/orders`, icon: ClipboardList },
    { title: locale === 'ar' ? 'أكواد الشحن' : 'Top-up Codes', href: `/${locale}/admin/topup`, icon: CreditCard },
    { title: locale === 'ar' ? 'المحافظ' : 'Wallets', href: `/${locale}/admin/wallets`, icon: Wallet },
    { title: locale === 'ar' ? 'التذاكر' : 'Tickets', href: `/${locale}/admin/tickets`, icon: FileText },
    { title: locale === 'ar' ? 'سجل التدقيق' : 'Audit Log', href: `/${locale}/admin/audit`, icon: BarChart3 },
    { title: locale === 'ar' ? 'الإعدادات' : 'Settings', href: `/${locale}/admin/settings`, icon: Settings },
];
