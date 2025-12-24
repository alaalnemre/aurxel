import * as React from 'react';
import { Sidebar, NavItem } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    locale: string;
    navItems: NavItem[];
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    notificationCount?: number;
}

export function DashboardLayout({
    children,
    locale,
    navItems,
    user,
    notificationCount,
}: DashboardLayoutProps) {
    const isRTL = locale === 'ar';

    return (
        <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar items={navItems} locale={locale} />
            <div className="md:pl-64">
                <Header locale={locale} user={user} notificationCount={notificationCount} />
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}

export { Sidebar, Header };
export type { NavItem };
