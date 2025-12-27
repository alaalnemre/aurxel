'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentLocale = params.locale as string;
    const targetLocale = currentLocale === 'ar' ? 'en' : 'ar';

    const handleToggle = () => {
        const newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
        router.push(newPath);
    };

    return (
        <button
            onClick={handleToggle}
            className="p-2 hover:bg-bg-muted rounded-lg transition-colors flex items-center gap-1.5"
            aria-label={`Switch to ${targetLocale === 'ar' ? 'Arabic' : 'English'}`}
            title={targetLocale === 'ar' ? 'العربية' : 'English'}
        >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium uppercase hidden sm:inline">
                {targetLocale}
            </span>
        </button>
    );
}
