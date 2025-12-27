'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LanguageToggle({ locale }: { locale: string }) {
    const pathname = usePathname();

    // Get the path without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

    const targetLocale = locale === 'ar' ? 'en' : 'ar';
    const targetPath = `/${targetLocale}${pathWithoutLocale}`;

    return (
        <Link
            href={targetPath}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-border transition-colors"
            title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <span className="text-lg">
                {targetLocale === 'ar' ? '🇯🇴' : '🇬🇧'}
            </span>
            <span className="text-sm font-medium">
                {targetLocale === 'ar' ? 'عربي' : 'EN'}
            </span>
        </Link>
    );
}
