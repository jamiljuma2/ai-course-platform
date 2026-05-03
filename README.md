# AI for Beginners — Course Platform

A production-ready full-stack online course platform with M-Pesa payments, mini-LMS, and email automation. Built for the Kenyan market and priced at KES 3,000.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Backend/DB | Supabase (PostgreSQL, Auth, RLS) |
| Payments | M-Pesa Daraja API (STK Push / Lipa Na M-Pesa) |
| Email | Resend |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Edge Functions | Supabase Edge Functions (Deno) |

---

## 📁 Project Structure

```
ai-course-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── login/page.tsx              # Auth page
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Student LMS dashboard
│   │   │   ├── capstone/page.tsx       # Capstone submission
│   │   │   └── assignment/[id]/page.tsx
│   │   ├── admin/page.tsx              # Admin dashboard
│   │   └── api/
│   │       ├── mpesa/
│   │       │   ├── initiate/route.ts   # STK Push initiation
│   │       │   └── status/route.ts     # Payment status polling
│   │       ├── webhook/
│   │       │   └── mpesa/route.ts      # Safaricom callback handler
│   │       ├── progress/route.ts       # Lesson progress tracking
│   │       ├── courses/slug/[s]/       # Course lookup
│   │       └── admin/
│   │           ├── stats/route.ts      # Admin analytics
│   │           └── export/route.ts     # CSV export
│   ├── components/
│   │   ├── landing/                    # All landing page sections
│   │   └── lms/                        # LMS dashboard components
│   ├── lib/
│   │   ├── mpesa.ts                    # M-Pesa Daraja API library
│   │   ├── email.ts                    # Resend email service
│   │   └── supabase/
│   │       ├── client.ts               # Browser client
│   │       └── server.ts               # Server + admin clients
│   └── types/index.ts                  # TypeScript definitions
├── supabase/
│   ├── migrations/001_schema.sql       # Complete DB schema
│   └── functions/
│       └── post-payment-automation/    # Edge function
├── middleware.ts                       # Route protection
├── vercel.json                         # Deployment config
└── .env.example                        # Environment template
```

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ai-course-platform
npm install
```

### 2. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migrations/001_schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API
4. Copy your **service_role key** (keep secret!)

### 3. M-Pesa Daraja API Setup

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app → get **Consumer Key** and **Consumer Secret**
3. For sandbox: use the test shortcode `174379` and passkey from Daraja
4. For production: apply for a Paybill shortcode from Safaricom
5. Set `MPESA_CALLBACK_URL` = `https://your-domain.com/api/webhook/mpesa`
   - ⚠️ This URL **must be publicly accessible** — Safaricom cannot reach localhost
   - Use [ngrok](https://ngrok.com) for local development: `ngrok http 3000`

### 4. Resend Email Setup

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key
4. Set `EMAIL_FROM` = `noreply@yourdomain.com`

### 5. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MPESA_ENV` = `sandbox` or `production`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPPORT_EMAIL`
- `ADMIN_SECRET_KEY` (generate a random string)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_MEET_LINK`

### 6. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then add all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

**Important**: After deploying, update `MPESA_CALLBACK_URL` to your Vercel domain:
```
https://your-app.vercel.app/api/webhook/mpesa
```

---

## 💳 M-Pesa Payment Flow

```
Student fills form
       ↓
POST /api/mpesa/initiate
  → Creates payment record (pending)
  → Creates enrollment record (pending)
  → Calls Safaricom STK Push API
       ↓
STK Prompt appears on student's phone
       ↓
Student enters PIN
       ↓
Safaricom calls POST /api/webhook/mpesa
  → Updates payment (completed/failed)
  → Grants course_access = true
  → Sends enrollment email
       ↓
Frontend polls /api/mpesa/status every 3s
  → Shows success/failure to user
```

---

## 🛡 Security Notes

- All admin routes require `x-admin-key` header
- Course content is protected by Supabase RLS — only enrolled users can access
- M-Pesa webhook: Safaricom always sends to callback URL (validate ResultCode)
- Service role key never exposed to frontend
- Duplicate enrollment prevention built into initiation route

---

## 📊 Admin Dashboard

Access at `/admin` — requires your `ADMIN_SECRET_KEY`.

Features:
- Total students, enrollments, revenue
- Recent payment table with status
- Export all students to CSV

---

## 🎓 LMS Features

- 8 modules × 5–7 lessons each
- Lesson types: video, text, assignment
- Progress tracking per lesson
- Module completion indicators
- Capstone project submission
- Certificate trigger (manual review)

---

## 🔧 Adding Course Content

To add lessons, either:

**Option A - SQL:**
```sql
INSERT INTO lessons (module_id, title, content, video_url, duration_min, order_index, lesson_type)
VALUES ('your-module-uuid', 'Lesson Title', 'Content here', 'https://youtube.com/...', 25, 3, 'video');
```

**Option B - Supabase Dashboard:**
Go to Table Editor → lessons → Insert row

---

## 📈 Scaling (Bonus Features)

### Multi-course support
The schema already supports multiple courses. Add a course selection UI to `EnrollmentSection.tsx`.

### Instructor accounts
Set `role = 'instructor'` in the users table. Add instructor middleware to protect content management routes.

### Analytics
Integrate [PostHog](https://posthog.com) or [Plausible](https://plausible.io) for conversion and completion tracking.

### Certificates
Use a PDF generation service (Puppeteer or PDFMonkey) triggered when `capstone_projects.status` is set to `'approved'`.

---

## 🆘 Support

- Email: support@aicourse.co.ke
- M-Pesa issues: Check Safaricom Daraja console logs
- Supabase issues: Check project logs in Supabase Dashboard
