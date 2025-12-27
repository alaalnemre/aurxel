'use client';

import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

// Move applyTheme outside to avoid the lint error
function applyThemeToDOM(newTheme: Theme) {
    const root = document.documentElement;

    if (newTheme === 'system') {
        root.removeAttribute('data-theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
    } else {
        root.setAttribute('data-theme', newTheme);
        root.classList.toggle('dark', newTheme === 'dark');
    }
}

export function ThemeToggle({ locale }: { locale: string }) {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) {
            setTheme(stored);
            applyThemeToDOM(stored);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        const nextTheme: Record<Theme, Theme> = {
            'light': 'dark',
            'dark': 'system',
            'system': 'light',
        };
        const newTheme = nextTheme[theme];
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyThemeToDOM(newTheme);
    }, [theme]);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
                aria-label="Toggle theme"
            >
                <span className="text-lg">🌙</span>
            </button>
        );
    }

    const icons: Record<Theme, string> = {
        light: '☀️',
        dark: '🌙',
        system: '💻',
    };

    const labels: Record<Theme, { en: string; ar: string }> = {
        light: { en: 'Light', ar: 'فاتح' },
        dark: { en: 'Dark', ar: 'داكن' },
        system: { en: 'System', ar: 'النظام' },
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-border transition-colors"
            aria-label={`Theme: ${labels[theme][locale === 'ar' ? 'ar' : 'en']}`}
            title={labels[theme][locale === 'ar' ? 'ar' : 'en']}
        >
            <span className="text-lg transition-transform hover:scale-110">
                {icons[theme]}
            </span>
            <span className="text-sm font-medium hidden sm:inline">
                {labels[theme][locale === 'ar' ? 'ar' : 'en']}
            </span>
        </button>
    );
}
