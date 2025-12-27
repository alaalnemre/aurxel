// src/lib/supabase/index.ts
// Barrel export for Supabase utilities

export { createClient as createServerClient, getUser, requireAuth } from './server';
export { createClient as createBrowserClient } from './client';
export { updateSession } from './middleware';
