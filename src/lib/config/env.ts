/**
 * Environment configuration for JordanMarket
 * Safely access environment variables with defaults
 */

// Check if we're in maintenance mode
export function isMaintenanceMode(): boolean {
    return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
}

// Check if we're in production
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

// Get Supabase URL (safe for client)
export function getSupabaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }
    return url;
}

// Get Supabase anon key (safe for client)
export function getSupabaseAnonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
    }
    return key;
}

// Site configuration
export const siteConfig = {
    name: 'JordanMarket',
    description: 'Local marketplace for Jordan',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    defaultLocale: 'en',
    supportedLocales: ['en', 'ar'] as const,
};

// Feature flags
export const features = {
    maintenanceMode: isMaintenanceMode(),
    debugMode: process.env.NEXT_PUBLIC_DEBUG === 'true',
    rateLimiting: true,
    auditLogging: true,
};
