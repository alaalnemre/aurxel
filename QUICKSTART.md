# 🚀 Quick Start Guide

Fast track to get your marketplace running!

---

## 1️⃣ Create Supabase Project (5 mins)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create new project → Name it → Choose region near Jordan
3. Save your database password!

---

## 2️⃣ Get Credentials (1 min)

Settings ⚙️ → API → Copy:
- `Project URL`
- `anon public key`

---

## 3️⃣ Configure Environment (1 min)

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 4️⃣ Run Database Migration (2 mins)

**Dashboard Method:**
1. Supabase → SQL Editor → New query
2. Copy ALL of `supabase/migrations/001_initial_schema.sql`
3. Paste → Run
4. Wait for "Success" ✅

---

## 5️⃣ Create Admin User (3 mins)

**In Supabase:**
1. Authentication → Users → Add user
2. Email: `admin@example.com`, Password: (strong one)
3. ✅ Auto confirm user → Create

**Set Admin Role:**
1. Copy user UUID from users table
2. SQL Editor → Run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'paste-uuid-here';
```

---

## 6️⃣ Test Connection (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

No Supabase errors? ✅ You're ready!

---

## ✅ Done!

**Total time: ~15 minutes**

Next: Build your first feature! 🎉

**Full Guide**: See `SUPABASE_SETUP.md` for detailed instructions and troubleshooting.
