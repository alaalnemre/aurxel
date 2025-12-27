// src/lib/validations/auth.ts
// Zod validation schemas for authentication

import { z } from 'zod';

/**
 * Registration schema
 */
export const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must be less than 72 characters'),
    fullName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Become a seller schema
 */
export const becomeSellerSchema = z.object({
    storeName: z
        .string()
        .min(3, 'Store name must be at least 3 characters')
        .max(100, 'Store name must be less than 100 characters'),
    storeDescription: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
});

export type BecomeSellerInput = z.infer<typeof becomeSellerSchema>;

/**
 * Become a driver schema
 */
export const becomeDriverSchema = z.object({
    vehicleType: z
        .string()
        .max(50, 'Vehicle type must be less than 50 characters')
        .optional(),
    licenseNumber: z
        .string()
        .max(50, 'License number must be less than 50 characters')
        .optional(),
});

export type BecomeDriverInput = z.infer<typeof becomeDriverSchema>;
