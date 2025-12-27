// src/app/[locale]/(protected)/layout.tsx
// Protected layout that requires authentication
// IMPORTANT: Uses Node.js runtime and dynamic rendering for SSR auth

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components';

// Force Node.js runtime (not Edge) for auth
export const runtime = 'nodejs';

// Force dynamic rendering to prevent SSR auth caching issues
export const dynamic = 'force-dynamic';

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({ children, params }: Props) {
    const { locale } = await params;

    // Check authentication
    const user = await getUser();

    // IMPORTANT: redirect() must be called OUTSIDE try/catch
    // to avoid Next.js redirect boundary errors
    if (!user) {
        redirect(`/${locale}/login`);
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
            {/* Protected Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link
                        href="/"
                        className="text-xl font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        JordanMarket
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* User info */}
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.email}
                        </span>

                        <LanguageSwitcher />

                        {/* Logout button (placeholder - will be functional in later phases) */}
                        <form action={`/${locale}/logout`} method="POST">
                            <button
                                type="submit"
                                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
