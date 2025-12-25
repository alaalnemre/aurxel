/**
 * Production-grade server-side rate limiter using in-memory storage.
 * 
 * LIMITATIONS:
 * - In-memory storage: limits reset on server restart
 * - Single-instance: not shared across serverless instances
 * 
 * For production at scale, consider:
 * - Redis-based rate limiting
 * - Upstash Rate Limit
 * - Cloudflare Rate Limiting
 */

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
    windowMs: number;    // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;     // seconds until reset
}

export class RateLimitError extends Error {
    public readonly resetIn: number;
    public readonly code = 'RATE_LIMIT_EXCEEDED';

    constructor(resetIn: number) {
        super('Too many requests. Please try again later.');
        this.name = 'RateLimitError';
        this.resetIn = resetIn;
    }
}

// ============================================
// RATE LIMIT CONFIGURATIONS
// ============================================

export const RATE_LIMITS = {
    /** Auth: 5 attempts per minute (login, register) */
    AUTH: { windowMs: 60 * 1000, maxRequests: 5 },

    /** Checkout: 10 per minute (createOrder) */
    CHECKOUT: { windowMs: 60 * 1000, maxRequests: 10 },

    /** QANZ Redeem: 5 per minute (redeem codes) */
    QANZ_REDEEM: { windowMs: 60 * 1000, maxRequests: 5 },

    /** Admin Actions: 3 per minute (approve, confirm, generate) */
    ADMIN_ACTION: { windowMs: 60 * 1000, maxRequests: 3 },

    /** General API: 100 per minute */
    GENERAL: { windowMs: 60 * 1000, maxRequests: 100 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// ============================================
// RATE LIMIT CHECK (non-throwing)
// ============================================

/**
 * Check rate limit for a given key without throwing
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up old entries periodically (prevent memory leak)
    if (rateLimitStore.size > 10000) {
        for (const [k, v] of rateLimitStore.entries()) {
            if (v.resetAt < now) {
                rateLimitStore.delete(k);
            }
        }
    }

    // New window or expired window
    if (!record || record.resetAt < now) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: Math.ceil(config.windowMs / 1000),
        };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((record.resetAt - now) / 1000),
        };
    }

    // Increment count
    record.count += 1;
    rateLimitStore.set(key, record);

    return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetIn: Math.ceil((record.resetAt - now) / 1000),
    };
}

// ============================================
// RATE LIMIT ENFORCE (throwing)
// ============================================

/**
 * Enforce rate limit - throws RateLimitError if exceeded
 * 
 * @param key - Unique key for rate limiting (e.g., "AUTH:user123")
 * @param limit - Number of allowed requests
 * @param windowMs - Time window in milliseconds
 * @throws RateLimitError if rate limit exceeded
 * 
 * @example
 * ```ts
 * import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
 * 
 * // In a server action:
 * rateLimit({
 *   key: `AUTH:${userId || ip}`,
 *   limit: RATE_LIMITS.AUTH.maxRequests,
 *   windowMs: RATE_LIMITS.AUTH.windowMs
 * });
 * ```
 */
export function rateLimit(options: {
    key: string;
    limit: number;
    windowMs: number;
}): void {
    const result = checkRateLimit(options.key, {
        maxRequests: options.limit,
        windowMs: options.windowMs,
    });

    if (!result.allowed) {
        throw new RateLimitError(result.resetIn);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build a rate limit key from action type and identifier
 * 
 * @param action - The rate limit action type
 * @param identifier - User ID or IP address
 */
export function getRateLimitKey(
    action: RateLimitType,
    identifier: string
): string {
    return `${action}:${identifier}`;
}

/**
 * Apply rate limit for a specific action type
 * Convenience wrapper around rateLimit()
 * 
 * @param action - The rate limit action type
 * @param identifier - User ID or IP address
 * @throws RateLimitError if rate limit exceeded
 */
export function applyRateLimit(
    action: RateLimitType,
    identifier: string
): void {
    const config = RATE_LIMITS[action];
    rateLimit({
        key: getRateLimitKey(action, identifier),
        limit: config.maxRequests,
        windowMs: config.windowMs,
    });
}

/**
 * Check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
    return error instanceof RateLimitError;
}

/**
 * Get localized rate limit error message
 */
export function getRateLimitMessage(locale: string = 'en'): string {
    if (locale === 'ar') {
        return 'طلبات كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً.';
    }
    return 'Too many requests. Please try again later.';
}
