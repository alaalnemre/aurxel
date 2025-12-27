// src/components/LanguageSwitcher.tsx
// Client component for switching between locales

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex items-center gap-2">
            {locales.map((loc) => (
                <button
                    key={loc}
                    onClick={() => handleChange(loc)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${locale === loc
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    aria-label={`Switch to ${localeNames[loc]}`}
                >
                    {localeNames[loc]}
                </button>
            ))}
        </div>
    );
}
