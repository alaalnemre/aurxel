import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'JordanMarket - Local Marketplace',
    description: 'Jordan\'s premier multi-vendor marketplace connecting buyers, sellers, and drivers.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
