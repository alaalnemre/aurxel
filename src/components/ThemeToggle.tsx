'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
};

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const updateTheme = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    if (!mounted) {
        return (
            <button className="p-2 hover:bg-bg-muted rounded-lg transition-colors" aria-label="Toggle theme">
                <div className="w-5 h-5" />
            </button>
        );
    }

    const icons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    };

    const nextTheme: Record<Theme, Theme> = {
        light: 'dark',
        dark: 'system',
        system: 'light',
    };

    const CurrentIcon = icons[theme];

    return (
        <button
            onClick={() => updateTheme(nextTheme[theme])}
            className="p-2 hover:bg-bg-muted rounded-lg transition-colors"
            aria-label={`Switch to ${nextTheme[theme]} theme`}
            title={`Theme: ${theme}`}
        >
            <CurrentIcon className="w-5 h-5" />
        </button>
    );
}
