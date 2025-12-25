'use client';

import { useTranslations } from 'next-intl';
import { logout } from '@/app/[locale]/(auth)/actions';

export function LogoutButton() {
    const t = useTranslations();

    return (
        <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
            {t('nav.logout')}
        </button>
    );
}
