// src/app/[locale]/(auth)/layout.tsx
// Layout for auth pages (login, register)

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components';

type Props = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
            {/* Simple header */}
            <header className="flex items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    JordanMarket
                </Link>
                <LanguageSwitcher />
            </header>

            {/* Content */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                {children}
            </main>
        </div>
    );
}
