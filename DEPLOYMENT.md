# Deployment Guide - Vercel

## Prerequisites

- Supabase project created and configured
- Environment variables ready
- GitHub repository (recommended)

## Step 1: Prepare Environment Variables

Create `.env.production` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 2: Vercel Deployment

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add environment variables from `.env.production`
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Step 4: Post-Deployment

### Update Supabase Settings

1. Go to Supabase Dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Vercel URL to "Site URL"
4. Add callback URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/en/auth/callback`
   - `https://your-domain.vercel.app/ar/auth/callback`

### Enable Supabase Realtime (Optional)

For real-time features in the future:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
```

## Step 5: Verify Deployment

Test these critical flows:
- ✅ Registration (all roles)
- ✅ Login and role-based redirects
- ✅ Admin panel access
- ✅ Vendor onboarding
- ✅ Product creation
- ✅ Order placement
- ✅ Driver deliveries

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | `eyJhbG...` |

## Performance Optimization

### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Enable Compression

Already configured in Next.js, but verify in `next.config.ts`:
```typescript
compress: true
```

## Monitoring

### Enable Vercel Analytics

1. In project settings, enable "Analytics"
2. Add to `layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Enable Speed Insights

```bash
npm install @vercel/speed-insights
```

Add to `layout.tsx`:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

<SpeedInsights />
```

## Troubleshooting

### Build Failures

- Check TypeScript errors: `npm run build`
- Verify all dependencies are in `package.json`
- Check Node.js version (use LTS)

### Authentication Issues

- Verify Supabase callback URLs
- Check environment variables are set correctly
- Ensure `.env.local` is not deployed (use Vercel env vars)

### Performance Issues

- Enable Next.js Image Optimization
- Use Vercel Edge Functions for API routes
- Enable caching headers

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Supabase RLS policies enabled
- [ ] CORS configured in Supabase
- [ ] API rate limiting configured
- [ ] Content Security Policy headers set

## Rollback Strategy

Vercel keeps deployment history:
1. Go to "Deployments" tab
2. Find previous working deployment
3. Click "Promote to Production"

---

**Ready for Production!** 🚀

Your multi-vendor marketplace is now live and accessible worldwide.
