# System & Architecture Audit: Next.js 15 to Cloudflare Workers

**Project:** Er G – Engineering Hub Nepal (`erg-platform`)  
**Domain:** `www.erganesh.com.np`  
**Repository:** `ErGaneshBabu99/erg-platform`  
**Date:** October 30, 2026  
**Status:** Audit completed prior to code modifications.

---

## 1. Vercel-Specific APIs and Config

| Component | Status in Project | Cloudflare Strategy |
|---|---|---|
| **`@vercel/blob`** | Installed (`^2.8.0`), imported only in `app/api/report-check/upload-url/route.ts`. | **Not actively used by frontend**. `ReportUploader.tsx` submits files directly to `POST /api/report-check/upload` via `multipart/form-data`. This unused stub can remain or be transitioned to Cloudflare R2 if upload tokens are needed later. |
| **`@vercel/analytics` / `@vercel/speed-insights`** | Not installed in `package.json`. | Only referenced in CSP headers (`vitals.vercel-insights.com`). No runtime dependency. |
| **`vercel.json`** | **Not present**. | Removed in commit `8a79940` when the temporary Blob cleanup cron was deleted. |
| **Vercel Cron Jobs** | None active. | No cron handlers exist in `app/api/cron/`. |
| **`.vercel/` directory** | Contains project link `prj_HC8NjnYaLqwuYkW10ggDzaMIrF6t`. | **Left untouched** to ensure zero interference with existing Vercel deployments during rollback. |

---

## 2. Middleware & Runtime

- **File:** `middleware.ts`
- **Current Runtime:** Runs on Next.js Edge Runtime (standard V8 isolate).
- **Functionality:**
  1. Applies security headers: Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.
  2. Protects the admin panel (`/${ADMIN_SECRET_PATH}`): verifies JWT session token using `getToken({ req, secret: process.env.NEXTAUTH_SECRET })` from `next-auth/jwt`. Redirects unauthorized users to `/auth/login`.
  3. Attaches incoming client IP via `X-Request-IP`.
- **Cloudflare Workers Compatibility:** **100% compatible**. OpenNext Cloudflare compiles Next.js middleware directly into the Worker request pipeline.

---

## 3. `next/image` Usage

- **Occurrences:**
  - `components/home/about-me.tsx` (`/logo.png`)
  - `components/home/hero.tsx` (`/Banner1.png` – `/Banner4.png`)
  - `components/home/founder-section.tsx` (`/images/founder/ganesh-*.jpg`)
  - `components/home/ganesh-post-preview.tsx` (`/images/founder/ganesh-1.jpg`)
  - `app/(public)/blog/[slug]/page.tsx` (`/images/founder/ganesh-1.jpg`)
- **Note on External Images:** Blog article covers on `/blog/[slug]` use standard HTML `<img>` elements (`<img src={post.image} ... />`), bypassing Next.js image optimization.
- **Decision:** Set `images: { unoptimized: true }` in `next.config.ts`.
  - *Rationale:* All images processed by `next/image` are local static assets authored at exact display dimensions. Serving them unoptimized allows Cloudflare Workers to serve them directly from the edge cache via Workers Assets (`ASSETS` binding), achieving zero CPU overhead, zero external dependencies (avoiding native Node `sharp`), and no extra subscription costs (avoiding Cloudflare Images add-ons).

---

## 4. Filesystem & Node-Only APIs

- **`argon2`**: Present in `package.json`, but **not imported or used** anywhere in the runtime code. Authentication exclusively uses `bcryptjs` (pure JavaScript, fully supported on Workers).
- **`sharp`**: Present in `package.json` for server-side Next.js image resizing. Setting `images: { unoptimized: true }` ensures `sharp` is never invoked at runtime.
- **`pdf-parse` & `mammoth`**: Used in `lib/report-check/extractor.ts` to parse uploaded PDF and DOCX files in memory from `Buffer`.
  - Supported under Cloudflare Workers with `compatibility_flags = ["nodejs_compat"]`.
  - *Important Resource Note:* Document parsing on heavy documents consumes CPU time. On the Workers Free plan (50ms CPU limit), large PDFs can exceed limits; on Workers Paid (30s CPU limit), parsing runs smoothly.
- **Filesystem writes (`fs.writeFileSync`, etc.)**: None present in request routes. Only offline migration/sync scripts (`scripts/*.ts`) use `fs`.

---

## 5. Authentication (Admin Login)

- **Library:** `next-auth` (v4.24.11) with `@auth/prisma-adapter`.
- **Provider:** `CredentialsProvider` (Email + Password) with optional Google OAuth.
- **Password Verification:** Pure JavaScript `bcryptjs.compare` against hashed password in Supabase PostgreSQL (`User` model).
- **Session Strategy:** JWT session (`strategy: "jwt"`, `maxAge: 24 * 60 * 60` / 24 hours).
- **Cookies:** Standard NextAuth secure cookies (`__Secure-next-auth.session-token` on HTTPS).
- **Callback URL:** Derived from request URL or `NEXTAUTH_URL`.

---

## 6. Email Delivery

- **Domain Email:** `contact@erganesh.com.np`.
- **Mechanism:** Managed directly via **Cloudflare Email Routing** in the Cloudflare DNS dashboard, which routes all incoming emails to the owner's destination address.
- **Contact Form (`app/api/contact/route.ts`):** Validates input with Zod and records the inquiry directly into PostgreSQL (`ContactInquiry` table). Outgoing automated notification is commented out (`// TODO: Send email notification via Resend`). There are no external SMTP or third-party email SDK calls to migrate.

---

## 7. Environment Variables in Use (Names Only)

Add these variables in the Cloudflare Dashboard under **Workers & Pages > erg-platform > Settings > Variables and Secrets**:

### Database & Bindings (Hyperdrive)
- `DATABASE_URL` (Standard pooled connection string for build/tooling)
- `DIRECT_URL` (Direct session connection string for Prisma CLI)

### Authentication
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (Set to `https://www.erganesh.com.np`)
- `ADMIN_SECRET_PATH` (e.g. `admin`)

### Public Site Configuration
- `NEXT_PUBLIC_SITE_URL` (Set to `https://www.erganesh.com.np`)
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_PHONE_NUMBER`
- `NEXT_PUBLIC_EMAIL`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### AI Report Reviewer
- `REPORT_CHECK_AI_PROVIDER` (`gemini`)
- `GEMINI_API_KEY`
- `GEMINI_API_KEY_1`
- `GEMINI_API_KEY_2`
- `GEMINI_API_KEY_3`
- `GEMINI_API_KEY_4`
- `GEMINI_API_KEY_5`
- `GEMINI_MODEL`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `ANTHROPIC_API_KEY` (optional)
- `ANTHROPIC_MODEL` (optional)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)

### Security & Rate Limiting
- `RATE_LIMIT_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`

### Storage & Release Automation (build/scripts only)
- `GITHUB_TOKEN`
- `GITHUB_REPO`

---

## 8. File & Asset Storage Architecture

| Asset Type | Current Storage | Target Cloudflare Behavior |
|---|---|---|
| **District Rate PDFs** | GitHub Releases (`tag: district-rate-pdfs`) | Accessed via `/api/download-pdf`. The Worker streams the final PDF, follows upstream redirects to GitHub S3 storage, and sets `Cache-Control: public, max-age=31536000, immutable`. Cloudflare Edge caches the complete PDF, eliminating GitHub rate limits. |
| **Site Logos & Banners** | Local Git repo (`public/`) | Served via Cloudflare Workers Assets (`ASSETS` binding) as high-speed static files. |
| **Blogger Post Images** | Google Blogger CDN | Loaded directly by client browsers via standard `<img>` tags. |
| **Incremental Static Cache (ISR)** | Local `.next/cache` on Vercel | Stored in Cloudflare R2 bucket (`NEXT_INC_CACHE_R2_BUCKET`) via `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`. |

---

## 9. Cloudflare Setup Mode

- **Current Status:** Cloudflare DNS and WAF proxy currently front the Vercel deployment.
- **Migration Target:** **Cloudflare Workers** using `@opennextjs/cloudflare` (OpenNext adapter for Next.js 15), providing full Node.js compatibility (`nodejs_compat`), R2 incremental caching, and Hyperdrive acceleration.

---

## 10. Database Host & Worker Adapter Choice

- **Database Host:** **Supabase** (PostgreSQL in AWS Singapore `ap-southeast-1`).
- **Worker Connection Strategy:** **Cloudflare Hyperdrive** paired with `@prisma/adapter-pg`.
  - *Two-Line Explanation:* Cloudflare Workers cannot maintain long-lived direct TCP connection pools to Postgres without socket exhaustion. Hyperdrive provides globally distributed connection pooling with low latency, and `@prisma/adapter-pg` allows Prisma to execute queries through Hyperdrive's accelerated connection.
