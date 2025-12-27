// src/components/Header.tsx
// Main navigation header component

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
    const t = useTranslations('nav');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    JordanMarket
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        {t('home')}
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        {t('login')}
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {t('register')}
                    </Link>
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
}
