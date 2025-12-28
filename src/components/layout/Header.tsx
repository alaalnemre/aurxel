'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import { logoutUser } from '@/actions/auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface HeaderProps {
    locale: string;
    profile: Profile | null;
}

export function Header({ locale, profile }: HeaderProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isRTL = locale === 'ar';
    const otherLocale = locale === 'en' ? 'ar' : 'en';

    const isActive = (path: string) => pathname.startsWith(`/${locale}${path}`);

    const handleLogout = async () => {
        await logoutUser();
        router.push(`/${locale}/login`);
        router.refresh();
    };

    const navLinkClass = (path: string) => `
    relative px-1 py-2 text-sm font-medium transition-colors
    ${isActive(path)
            ? 'text-primary'
            : 'text-gray-600 hover:text-primary'
        }
    ${isActive(path) ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : ''}
  `;

    return (
        <header className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${locale}/store`} className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <span className="text-white font-bold text-lg">J</span>
                        </div>
                        <span className="font-bold text-xl text-dark">
                            {t('common.appName')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href={`/${locale}/store`} className={navLinkClass('/store')}>
                            {t('nav.store')}
                        </Link>
                        <Link href={`/${locale}/cart`} className={navLinkClass('/cart')}>
                            {t('nav.cart')}
                        </Link>
                        <Link href={`/${locale}/orders`} className={navLinkClass('/orders')}>
                            {t('nav.orders')}
                        </Link>

                        {profile?.seller_verified && (
                            <Link href={`/${locale}/seller`} className={navLinkClass('/seller')}>
                                {t('nav.seller')}
                            </Link>
                        )}

                        {profile?.driver_verified && (
                            <Link href={`/${locale}/driver`} className={navLinkClass('/driver')}>
                                {t('nav.driver')}
                            </Link>
                        )}

                        {profile?.is_admin && (
                            <Link href={`/${locale}/admin`} className={navLinkClass('/admin')}>
                                {t('nav.admin')}
                            </Link>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <Link
                            href={`/${otherLocale}/store`}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary border border-border rounded-lg hover:border-primary-300 transition-all"
                        >
                            {otherLocale === 'ar' ? 'العربية' : 'English'}
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary-soft transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary-soft rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold text-sm">
                                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-52 bg-white rounded-xl shadow-lg border border-border py-2 z-50`}>
                                    <div className="px-4 py-2 border-b border-border">
                                        <p className="text-sm font-semibold text-dark">{profile?.full_name || 'User'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Buyer Account</p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href={`/${locale}/profile`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('nav.profile')}
                                        </Link>

                                        {!profile?.seller_verified && (
                                            <Link
                                                href={`/${locale}/become-seller`}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {t('nav.becomeSeller')}
                                            </Link>
                                        )}

                                        {!profile?.driver_verified && (
                                            <Link
                                                href={`/${locale}/become-driver`}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                {t('nav.becomeDriver')}
                                            </Link>
                                        )}
                                    </div>

                                    <div className="pt-1 border-t border-border">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error-soft transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('auth.logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-primary-soft transition-colors"
                        >
                            <svg className="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-1">
                            <Link
                                href={`/${locale}/store`}
                                className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/store') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.store')}
                            </Link>
                            <Link
                                href={`/${locale}/cart`}
                                className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/cart') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.cart')}
                            </Link>
                            <Link
                                href={`/${locale}/orders`}
                                className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/orders') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.orders')}
                            </Link>

                            {profile?.seller_verified && (
                                <Link
                                    href={`/${locale}/seller`}
                                    className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/seller') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.seller')}
                                </Link>
                            )}

                            {profile?.driver_verified && (
                                <Link
                                    href={`/${locale}/driver`}
                                    className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/driver') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.driver')}
                                </Link>
                            )}

                            {profile?.is_admin && (
                                <Link
                                    href={`/${locale}/admin`}
                                    className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin') ? 'bg-primary-soft text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.admin')}
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
