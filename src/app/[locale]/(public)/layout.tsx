// src/app/[locale]/(public)/layout.tsx
// Layout for public pages with header

import { Header } from '@/components';

type Props = {
    children: React.ReactNode;
};

export default function PublicLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} JordanMarket. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
