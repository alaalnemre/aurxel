import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface PageMetadataProps {
    params: Promise<{ locale: string }>;
}

// Homepage metadata
export async function generateHomeMetadata({ params }: PageMetadataProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata' });

    return {
        title: 'MarketHub - Jordan\'s Leading Multi-Vendor Marketplace',
        description: 'Discover the best products and services in Jordan. Shop from verified vendors, order food, pharmacy items, groceries, and more. Cash on Delivery available.',
        keywords: ['jordan marketplace', 'online shopping jordan', 'food delivery amman', 'pharmacy online jordan', 'grocery delivery'],
        authors: [{ name: 'MarketHub' }],
        creator: 'MarketHub',
        publisher: 'MarketHub',
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            type: 'website',
            locale: locale === 'ar' ? 'ar_JO' : 'en_US',
            url: 'https://markethub.jo',
            title: 'MarketHub - Jordan\'s Multi-Vendor Marketplace',
            description: 'Shop from verified vendors in Jordan. Fast delivery, Cash on Delivery available.',
            siteName: 'MarketHub',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'MarketHub - Jordan\'s Marketplace',
            description: 'Shop from verified vendors. COD available.',
        },
        alternates: {
            canonical: '/',
            languages: {
                'en': '/en',
                'ar': '/ar',
            },
        },
    };
}

// Product detail metadata
export function generateProductMetadata(productName: string, productDescription: string, price: number): Metadata {
    return {
        title: `${productName} | MarketHub`,
        description: productDescription || `Buy ${productName} on MarketHub. Cash on Delivery available.`,
        openGraph: {
            type: 'product',
            title: productName,
            description: productDescription,
        },
        twitter: {
            card: 'summary_large_image',
            title: productName,
            description: productDescription,
        },
    };
}

// Vendor store metadata
export function generateVendorMetadata(vendorName: string, category: string, rating: number): Metadata {
    return {
        title: `${vendorName} - ${category} | MarketHub`,
        description: `Shop from ${vendorName}, a verified ${category} vendor on MarketHub. Rating: ${rating}/5`,
        openGraph: {
            type: 'website',
            title: vendorName,
            description: `Verified ${category} vendor with ${rating}/5 rating`,
        },
    };
}
