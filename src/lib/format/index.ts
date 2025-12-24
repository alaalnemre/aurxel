// ============================================
// Formatting Utilities
// ============================================

/**
 * Format currency in JOD (Jordanian Dinar)
 */
export function formatCurrency(
    amount: number,
    locale: 'en' | 'ar' = 'en'
): string {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
        style: 'currency',
        currency: 'JOD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format QANZ coins (internal currency)
 */
export function formatQanz(amount: number, locale: 'en' | 'ar' = 'en'): string {
    const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return locale === 'ar' ? `${formatted} قنز` : `${formatted} QANZ`;
}

/**
 * Format date for display
 */
export function formatDate(
    date: string | Date,
    locale: 'en' | 'ar' = 'en',
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(
        locale === 'ar' ? 'ar-JO' : 'en-JO',
        options
    ).format(d);
}

/**
 * Format date and time
 */
export function formatDateTime(
    date: string | Date,
    locale: 'en' | 'ar' = 'en'
): string {
    return formatDate(date, locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
    date: string | Date,
    locale: 'en' | 'ar' = 'en'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', {
        numeric: 'auto',
    });

    if (diffDays > 0) return rtf.format(-diffDays, 'day');
    if (diffHours > 0) return rtf.format(-diffHours, 'hour');
    if (diffMins > 0) return rtf.format(-diffMins, 'minute');
    return rtf.format(-diffSecs, 'second');
}

/**
 * Format phone number for Jordan
 */
export function formatPhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Format as +962 7X XXX XXXX
    if (digits.startsWith('962')) {
        return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    if (digits.startsWith('07')) {
        return `+962 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
}
