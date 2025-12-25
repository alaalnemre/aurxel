# JordanMarket (Aurxel) - Deployment Guide

## Production Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **Styling**: TailwindCSS

---

## Pre-Deployment Checklist

### Environment Variables
Required in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=https://aurxel.vercel.app
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://aurxel.vercel.app/auth/callback
```

### Supabase Auth URL Configuration (CRITICAL)
In **Supabase Dashboard → Auth → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://aurxel.vercel.app` |
| Redirect URLs | `https://aurxel.vercel.app/**` |
| | `https://*.vercel.app/**` |
| | `http://localhost:3000/**` |

> ⚠️ **Preview deployments**: The wildcard `https://*.vercel.app/**` allows Vercel preview URLs to work.

### Supabase Configuration

#### Database Triggers (Required)
- ✅ `on_auth_user_created` - Creates profile on user signup
- ✅ `on_profile_created_create_wallet` - Auto-creates wallet for new profiles

#### RLS Policies (Required)
All tables have RLS enabled with appropriate policies:
- `profiles` - Users can read/update own profile
- `wallet_accounts` - Users can read own wallet
- `orders` - Buyers see own orders, sellers see orders with their items
- `products` - Public read, seller write
- `notifications` - Users see own notifications

#### Storage Buckets
- `products` - Product images (public read)
- `avatars` - User avatars (authenticated read)

---

## Known Warnings (Non-Blocking)

### DYNAMIC_SERVER_USAGE Warning
During build, you may see:
```
Error: Dynamic server usage: Route /[locale]/admin couldn't be rendered statically because it used `cookies`.
```

**This is EXPECTED behavior**, not an error. These routes:
- Use Supabase auth which requires cookies
- Are correctly marked as dynamic (●) in build output
- Will render server-side on each request

### Build Output Legend
- `○` Static - Pre-rendered at build time
- `●` SSG - Pre-rendered with dynamic paths
- `ƒ` Dynamic - Server-rendered per request

---

## Post-Deployment Verification

### 1. Auth Flow
- [ ] Register new user → email confirmation sent
- [ ] Login → redirects to /buyer
- [ ] Logout → redirects to home

### 2. Dashboard Access
- [ ] /buyer loads for authenticated buyer
- [ ] /seller loads for approved seller
- [ ] /driver loads for approved driver
- [ ] /admin loads for admin role only

### 3. Error Handling
All dashboard routes have:
- `error.tsx` - User-friendly error boundary
- `loading.tsx` - Skeleton loading states
- `not-found.tsx` - 404 handling

---

## Monitoring

### Server Console Prefixes
All errors are logged with component prefixes for easy debugging:
- `[BuyerLayout]`, `[BuyerDashboard]`
- `[SellerLayout]`, `[SellerDashboard]`
- `[DriverLayout]`, `[DriverDashboard]`
- `[AdminLayout]`

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Something went wrong" | RLS policy blocking query | Check Supabase logs for policy violation |
| Infinite redirect loop | Missing profile/role | Verify `handle_new_user` trigger exists |
| Wallet shows 0.00 | Wallet not created | Verify `on_profile_created_create_wallet` trigger |

---

## Database Migrations

All migrations are in `src/db/migrations/` and should be run in order:
1. `001_core_schema.sql` - Core types and profiles
2. `002_products_schema.sql` - Products and categories
3. `003_shopping_schema.sql` - Carts and orders
4. `004_ratings_schema.sql` - Ratings system
5. `005_wallet_schema.sql` - QANZ wallet system
6. `006_notifications_schema.sql` - Notifications
7. `007_drivers_schema.sql` - Drivers and deliveries
8. `008_audit_log_schema.sql` - Audit logging
9. `009_rls_policies_part1.sql` - RLS enable
10. `010_rls_policies_part2.sql` - RLS policies

### Fix Scripts
- `src/db/fixes/001_fix_user_registration.sql` - Fixes profile creation trigger

---

## Version
- Last updated: 2025-12-25
- Phase 11-12 Complete: ✅ YES
- Build verified: ✅ Pass
- All dashboards hardened: ✅ YES

