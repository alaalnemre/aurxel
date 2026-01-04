# Supabase Setup Guide

Step-by-step instructions to set up Supabase for the Multi-Vendor Marketplace project.

---

## Prerequisites

- A [Supabase account](https://supabase.com) (free tier works)
- Supabase CLI installed (optional, for local development)

---

## Step 1: Create a Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Project Name**: `markethub` (or your preferred name)
     - **Database Password**: Choose a strong password (save it!)
     - **Region**: Choose closest to Jordan (e.g., EU Central, Frankfurt)
     - **Pricing Plan**: Free (sufficient for development)
   - Click "Create new project"
   - Wait 2-3 minutes for project provisioning

---

## Step 2: Get Your API Credentials

1. **Navigate to Project Settings**
   - In your project dashboard, click the ⚙️ Settings icon (bottom left)
   - Go to "API" section

2. **Copy Your Credentials**
   You need two values:
   
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon (public) key**: Long string starting with `eyJ...`

   > ⚠️ **Note**: Keep these credentials secure. Never commit them to Git!

---

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** in your project root:
   ```bash
   # In: c:\Users\nimri\Desktop\aurxel\.env.local
   ```

2. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Replace the placeholder values** with your actual credentials from Step 2

4. **Verify the file is in `.gitignore`**
   - Check that `.env.local` is listed in `.gitignore`
   - This prevents accidental credential exposure

---

## Step 4: Run the Database Migration

### Option A: Using Supabase Dashboard (Recommended for First Time)

1. **Open SQL Editor**
   - In Supabase Dashboard, click "SQL Editor" in left sidebar
   - Click "New query"

2. **Copy Migration SQL**
   - Open `supabase/migrations/001_initial_schema.sql` from your project
   - Copy the entire contents

3. **Paste and Run**
   - Paste the SQL into the editor
   - Click "Run" button (or press `Ctrl+Enter`)
   - Wait for execution (should take 5-10 seconds)

4. **Verify Success**
   - You should see "Success. No rows returned" message
   - Check the "Database" section in left sidebar
   - You should see 7 new tables under "Tables"

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migration
supabase db push
```

---

## Step 5: Verify Database Setup

1. **Check Tables**
   - Go to "Table Editor" in Supabase Dashboard
   - You should see these tables:
     - ✅ profiles
     - ✅ vendors
     - ✅ products
     - ✅ addresses
     - ✅ orders
     - ✅ order_items
     - ✅ deliveries

2. **Check Enums**
   - Go to "Database" → "Enums"
   - You should see:
     - ✅ user_role
     - ✅ vendor_category
     - ✅ order_status
     - ✅ delivery_status
     - ✅ payment_method

3. **Check RLS Policies**
   - Click on any table (e.g., "products")
   - Look for "RLS enabled" badge
   - Click "Policies" tab to see security rules

---

## Step 6: Create Your First Admin User

Since you need an admin user to manage the platform:

1. **Go to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

2. **Create Admin User**
   - Click "Add user" → "Create new user"
   - Fill in:
     - **Email**: your-admin@example.com
     - **Password**: Strong password
     - **Auto Confirm User**: ✅ Enable
   - Click "Create user"

3. **Set Admin Role**
   - Copy the user's UUID from the Users table
   - Go to "SQL Editor"
   - Run this query (replace `UUID` with actual ID):
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = 'paste-user-uuid-here';
   ```

---

## Step 7: Test the Connection

1. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Check for connection errors**:
   - Look at terminal for any Supabase-related errors
   - You should NOT see authentication errors

3. **Test in Browser**:
   ```
   http://localhost:3000
   ```
   - The app should load (even if routes show 404, Supabase is connected)

---

## Step 8: Enable Email Authentication (Optional)

For production use:

1. **Configure Email Provider**
   - Go to "Authentication" → "Providers"
   - Enable "Email" provider
   - Configure SMTP settings (or use Supabase default)

2. **Set Email Templates**
   - Go to "Authentication" → "Email Templates"
   - Customize confirmation, password reset emails
   - Add your app's logo and branding

---

## Troubleshooting

### Error: "Invalid API key"
- ✅ Check that you copied the full anon key
- ✅ Verify no extra spaces in `.env.local`
- ✅ Restart dev server after changing `.env.local`

### Error: "relation does not exist"
- ✅ Ensure migration ran successfully
- ✅ Check SQL Editor for any error messages
- ✅ Verify you're connected to correct project

### Error: "new row violates row-level security policy"
- ✅ Check that RLS policies are created
- ✅ Verify user has correct role in profiles table
- ✅ Review policy conditions in Database → Policies

### Can't see tables in dashboard
- ✅ Refresh the browser page
- ✅ Check migration ran without errors
- ✅ Verify you're in correct project

---

## Next Steps

✅ Supabase is configured!

Now you can:
1. **Create auth pages** (login/register)
2. **Build admin dashboard**
3. **Implement vendor registration**
4. **Add product catalog**

---

## Useful Commands

```bash
# Restart dev server (after env changes)
npm run dev

# Check TypeScript types
npx tsc --noEmit

# View Supabase project
supabase projects list

# Reset database (⚠️ DESTROYS ALL DATA)
supabase db reset
```

---

## Resources

- 📖 [Supabase Docs](https://supabase.com/docs)
- 🔐 [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- 🚀 [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Setup Complete!** 🎉

Your database is ready for the multi-vendor marketplace.
