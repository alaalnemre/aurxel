# JordanMarket Deployment Checklist

## Prerequisites

- [ ] Supabase project created
- [ ] Vercel account linked to GitHub repo

## Environment Variables

Configure these in Vercel Project Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) |
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g., https://jordanmarket.vercel.app) |

## Database Setup

1. **Run Migration**
   - Go to Supabase Dashboard > SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

2. **Seed Data (Optional)**
   - Execute `supabase/seed.sql` for sample discount codes

3. **Create Admin User**
   - Register a user through the app
   - In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-admin@email.com';
   ```

## Supabase Configuration

1. **Authentication**
   - Enable Email/Password provider
   - Set Site URL in Auth > URL Configuration
   - Add redirect URLs for production

2. **RLS Policies**
   - Verify RLS is enabled (migration does this automatically)

## Vercel Deployment

1. **Connect Repository**
   - Import from GitHub
   - Framework: Next.js (auto-detected)

2. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Deploy**
   - Push to main branch
   - Vercel auto-deploys

## Post-Deployment

- [ ] Verify auth flow (register, login, logout)
- [ ] Verify buyer dashboard loads
- [ ] Verify store page loads
- [ ] Create test seller account
- [ ] Admin approves seller
- [ ] Seller adds product
- [ ] Buyer can add to cart & checkout

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL enabled (automatic on Vercel)
- [ ] Error tracking setup (optional: Sentry)
- [ ] Analytics setup (optional: Google Analytics)
