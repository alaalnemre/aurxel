'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function Header() {
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const otherLocale = locale === 'ar' ? 'en' : 'ar';
    const localeLabel = locale === 'ar' ? 'EN' : 'عربي';

    // Get path without locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    const switchLocalePath = `/${otherLocale}${pathWithoutLocale}`;

    return (
        <header className="sticky top-0 z-50 glass border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">J</span>
                        </div>
                        <span className="font-bold text-xl hidden sm:block">{tCommon('appName')}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href={`/${locale}`}
                            className="text-secondary hover:text-foreground transition-colors"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            href={`/${locale}/products`}
                            className="text-secondary hover:text-foreground transition-colors"
                        >
                            {t('products')}
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <Link
                            href={switchLocalePath}
                            className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all"
                        >
                            {localeLabel}
                        </Link>

                        {/* Cart */}
                        <Link
                            href={`/${locale}/cart`}
                            className="p-2 text-secondary hover:text-foreground transition-colors relative"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </Link>

                        {/* Auth Buttons */}
                        <Link
                            href={`/${locale}/login`}
                            className="hidden sm:block px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors"
                        >
                            {t('login')}
                        </Link>
                        <Link
                            href={`/${locale}/register`}
                            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                        >
                            {t('register')}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-secondary hover:text-foreground"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border animate-fadeIn">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href={`/${locale}`}
                                className="px-4 py-2 text-secondary hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('home')}
                            </Link>
                            <Link
                                href={`/${locale}/products`}
                                className="px-4 py-2 text-secondary hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('products')}
                            </Link>
                            <Link
                                href={`/${locale}/login`}
                                className="px-4 py-2 text-secondary hover:text-foreground hover:bg-muted rounded-lg transition-colors sm:hidden"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('login')}
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
