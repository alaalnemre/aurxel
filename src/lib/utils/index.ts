import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: string = 'en'): string {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
        style: 'currency',
        currency: 'JOD',
    }).format(price);
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date));
}

export function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `JM-${timestamp}-${random}`;
}

export function getInitials(name: string | null): string {
    if (!name) return '?';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
