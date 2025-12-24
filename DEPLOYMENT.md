# JordanMarket Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Configuration
- [ ] Create production Supabase project
- [ ] Run all migrations (001-012) in order
- [ ] Create storage buckets via Dashboard:
  - `avatars` (public)
  - `product-images` (public)
  - `kyc-documents` (private)
- [ ] Configure storage bucket policies per `011_storage_buckets.sql`
- [ ] Set up admin user via `012_seed_data.sql`
- [ ] Configure Auth > URL Configuration:
  - Site URL: `https://yourdomain.com`
  - Redirect URLs: `https://yourdomain.com/auth/callback`

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Email Configuration (Supabase)
- [ ] Auth > Email Templates - customize confirmation email
- [ ] Settings > Auth > Enable email confirmation
- [ ] (Optional) Configure custom SMTP for reliable delivery

## Build Verification
- [ ] Run `npm run build` - must pass with 0 errors
- [ ] Run `npm run start` - verify all pages load
- [ ] Test in both `/en` and `/ar` locales

## Functional Testing

### Authentication Flow
- [ ] Register new user → receives confirmation email
- [ ] Confirm email → redirects to login
- [ ] Login → redirects to appropriate dashboard
- [ ] Logout → redirects to homepage
- [ ] Password reset flow works

### Buyer Flow
- [ ] View shop page with products
- [ ] View wallet balance
- [ ] Redeem top-up code (requires admin to generate)
- [ ] View order history

### Seller Flow
- [ ] Apply as seller (requires approval)
- [ ] After approval: access seller dashboard
- [ ] View products (empty state)
- [ ] Toggle product active/inactive
- [ ] Delete product
- [ ] Accept new order → moves to "Preparing"
- [ ] Mark order ready → moves to "Ready"

### Driver Flow
- [ ] Apply as driver (requires approval)
- [ ] After approval: access driver dashboard
- [ ] View available deliveries
- [ ] Accept delivery → moves to "Assigned"
- [ ] Mark picked up → moves to "Picked Up"
- [ ] Mark delivered → moves to "Delivered"

### Admin Flow
- [ ] Access admin dashboard
- [ ] View pending seller applications
- [ ] Approve/reject seller
- [ ] View pending driver applications
- [ ] Approve/reject driver
- [ ] Generate top-up codes
- [ ] Revoke top-up codes
- [ ] View all users

## Security Checklist
- [ ] RLS policies active on all tables
- [ ] Admin role protected in middleware
- [ ] No sensitive data exposed in client
- [ ] CORS configured properly
- [ ] Rate limiting considered

## Performance
- [ ] Images optimized via Next.js Image
- [ ] Static pages pre-rendered
- [ ] API responses cached where appropriate

## Deployment Platforms
- **Recommended**: Vercel (native Next.js support)
- **Alternative**: Railway, Render, AWS Amplify

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

## Post-Deployment
- [ ] Verify all routes accessible
- [ ] Test authentication end-to-end
- [ ] Monitor Supabase dashboard for errors
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure analytics (Vercel Analytics)

## Known Limitations
1. Cart/checkout flow UI not fully implemented (server actions ready)
2. Product image upload pending storage bucket setup
3. Notifications not real-time (polling or Supabase Realtime needed)
4. Password reset template needs customization

---

**Build Status**: ✅ 45 pages compiled successfully
**Last Updated**: 2024-12-24
