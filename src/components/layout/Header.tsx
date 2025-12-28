'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isRTL = locale === 'ar';
    const otherLocale = locale === 'en' ? 'ar' : 'en';

    const handleLogout = async () => {
        await logoutUser();
        router.push(`/${locale}/login`);
        router.refresh();
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${locale}/store`} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">J</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">
                            {t('common.appName')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href={`/${locale}/store`}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            {t('nav.store')}
                        </Link>
                        <Link
                            href={`/${locale}/cart`}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            {t('nav.cart')}
                        </Link>
                        <Link
                            href={`/${locale}/orders`}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            {t('nav.orders')}
                        </Link>

                        {/* Seller Link */}
                        {profile?.seller_verified && (
                            <Link
                                href={`/${locale}/seller`}
                                className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                {t('nav.seller')}
                            </Link>
                        )}

                        {/* Driver Link */}
                        {profile?.driver_verified && (
                            <Link
                                href={`/${locale}/driver`}
                                className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                {t('nav.driver')}
                            </Link>
                        )}

                        {/* Admin Link */}
                        {profile?.is_admin && (
                            <Link
                                href={`/${locale}/admin`}
                                className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                {t('nav.admin')}
                            </Link>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Language Switcher */}
                        <Link
                            href={`/${otherLocale}/store`}
                            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                        >
                            {otherLocale === 'ar' ? 'العربية' : 'English'}
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-medium text-sm">
                                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50`}>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                                    </div>

                                    <Link
                                        href={`/${locale}/profile`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        {t('nav.profile')}
                                    </Link>

                                    {!profile?.seller_verified && (
                                        <Link
                                            href={`/${locale}/become-seller`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            {t('nav.becomeSeller')}
                                        </Link>
                                    )}

                                    {!profile?.driver_verified && (
                                        <Link
                                            href={`/${locale}/become-driver`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            {t('nav.becomeDriver')}
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        {t('auth.logout')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <nav className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col gap-2">
                            <Link
                                href={`/${locale}/store`}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.store')}
                            </Link>
                            <Link
                                href={`/${locale}/cart`}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.cart')}
                            </Link>
                            <Link
                                href={`/${locale}/orders`}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.orders')}
                            </Link>

                            {profile?.seller_verified && (
                                <Link
                                    href={`/${locale}/seller`}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.seller')}
                                </Link>
                            )}

                            {profile?.driver_verified && (
                                <Link
                                    href={`/${locale}/driver`}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.driver')}
                                </Link>
                            )}

                            {profile?.is_admin && (
                                <Link
                                    href={`/${locale}/admin`}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
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
