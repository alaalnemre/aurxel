import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // JordanMarket Brand Colors - Pantone 19-4922 TCX Teal Green
                primary: {
                    DEFAULT: '#0F6D64',
                    hover: '#0C5C55',
                    soft: '#E6F3F1',
                    50: '#E6F3F1',
                    100: '#CCE7E3',
                    200: '#99CFC7',
                    300: '#66B7AB',
                    400: '#339F8F',
                    500: '#0F6D64',
                    600: '#0C5C55',
                    700: '#094A44',
                    800: '#063933',
                    900: '#032722',
                },
                // Supporting colors
                dark: '#0F172A',
                border: '#E2E8F0',
                // Status colors
                success: {
                    DEFAULT: '#10B981',
                    soft: '#D1FAE5',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    soft: '#FEF3C7',
                },
                error: {
                    DEFAULT: '#EF4444',
                    soft: '#FEE2E2',
                },
                info: {
                    DEFAULT: '#3B82F6',
                    soft: '#DBEAFE',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
                arabic: ['Noto Sans Arabic', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
        },
    },
    plugins: [],
};

export default config;
