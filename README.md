# 🏗️ Er G – Engineering Hub Nepal

[![Website](https://img.shields.io/badge/Website-erganesh.com.np-004488?style=flat-square&logo=google-chrome&logoColor=white)](https://www.erganesh.com.np)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

**Er G (Engineering Hub Nepal)** is Nepal's premier digital resource platform for civil engineers, contractors, engineering students, and infrastructure professionals. Built by **Er. Ganesh Chapagain**, the platform provides verified official government district rates (जिल्ला दररेट) for all 77 constitutional districts of Nepal, technical engineering insights, BOQ estimation guidelines, and vacancy updates.

---

## 🌟 Key Platform Features

### 1. 🏛️ Complete 77 Districts Rate Database
- **All 77 Districts Covered**: Comprehensive official rate lists across all 7 provinces of Nepal for FY 2083/84 (and legacy fiscal years).
- **Dual-Language Search & Discovery**: Seamless search using official English and Devanagari (नेपाली) names (e.g. `रुकुम पूर्व`, `काठमाडौँ`, `नवलपुर`).
- **Interactive Rate Statistics**: Real-time tracked metrics for Total Downloads, Document Previews, and verified records.
- **In-Browser PDF Viewer**: Read and inspect official rate documents directly inside an interactive modal viewer without being forced to download.
- **Instant Direct Downloads**: High-speed, resilient CDN downloads for BOQ and tender estimation.

### 2. 🔍 Advanced SEO & Crawl Discovery Architecture
- **Canonical 4-Digit Fiscal Slugs**: Rolling migration from `[district]-2083-84` to canonical `[district]-2083-2084` with single-hop 301 redirects.
- **Rich Structured Data**: Fully compliant `DigitalDocument` and `BreadcrumbList` JSON-LD schemas verified for Google Search and Rich Results.
- **Dynamic Sitemap & Directory Hubs**: Automated `sitemap.xml` with priority weighting, static fallbacks, and internal province cross-linking directories on the homepage, `/district-rate`, and global footer.

### 3. 📝 Engineering Blog & Technical Resources
- Technical field reports, BOQ preparation guides, and infrastructure analysis articles.
- Responsive reading progress, table of contents, and social sharing.

### 4. 🤖 AI Engineering Report Reviewer
- Automated review tool providing structured suggestions for engineering reports, BOQs, theses, and DPR documentation.

### 5. 🛡️ Secure Admin Panel
- Role-based management (`SUPER_ADMIN`, `ADMIN`, `EDITOR`) protected by NextAuth JWT sessions.
- Real-time download analytics, search trends, inquiry management, and content publishing workflows.

---

## 📁 Project Structure

```
erg-platform/
├── app/
│   ├── (public)/                 # Public-facing server-rendered routes
│   │   ├── page.tsx              # Homepage with 77-district hub & latest updates
│   │   ├── district-rate/        # 77 Districts database & detail pages
│   │   │   ├── page.tsx          # District rate search, filters & directory
│   │   │   └── [slug]/           # Dynamic district rate page (ISR, Schema, Viewer)
│   │   ├── blog/                 # Engineering blog portal
│   │   ├── about/                # Founder story & platform mission
│   │   ├── contact/              # Inquiries and user feedback
│   │   └── report-check/         # AI Technical Report Reviewer
│   ├── admin/                    # Protected admin dashboard
│   │   ├── page.tsx              # Overview stats & recent activity
│   │   ├── district-rates/       # District rate CRUD management
│   │   ├── inquiries/            # Customer inquiries manager
│   │   └── analytics/            # Traffic & download trends
│   ├── api/                      # Backend API routes
│   │   ├── district-rate/        # Search, stats, and download tracking
│   │   ├── report-check/         # AI document analysis endpoints
│   │   └── auth/                 # NextAuth authentication endpoints
│   ├── sitemap.ts                # Dynamic XML sitemap generator
│   └── robots.ts                 # Crawler directives (Googlebot, Bingbot)
├── components/
│   ├── district/                 # District directory, live stats, viewers & cards
│   ├── layout/                   # Global Navbar, Footer with 77 district links
│   ├── home/                     # Hero, features, founder timeline, previews
│   └── ui/                       # Reusable UI primitives (buttons, badges, modals)
├── lib/
│   ├── district-nepali-names.ts  # Official 77 district Devanagari mappings
│   ├── slug-migration.ts         # Rolling batch migration controller
│   ├── seo.ts                    # Meta tags & Open Graph generators
│   ├── prisma.ts                 # Prisma ORM client singleton
│   ├── auth.ts                   # NextAuth JWT session configuration
│   └── security/                 # Rate limiting, CSP headers, audit logging
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema definition
│   └── seed.ts                   # Database seed for 77 districts
└── middleware.ts                  # Route protection & Content Security Policy
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components, ISR) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS with Dark/Light Theme Support |
| **Database** | PostgreSQL (hosted on Supabase) |
| **ORM** | Prisma ORM v6 with Connection Pooling |
| **Authentication** | NextAuth.js v4 (JWT session strategies) |
| **Icons & UI** | Lucide React |
| **Deployment** | Vercel (Edge CDN & Serverless Compute) |

---

## 🔒 Security Best Practices

This repository enforces industry-standard security safeguards:

1. **Zero Secret Exposure**:
   - Environment variables (`.env*`) are strictly ignored in `.gitignore` and never committed to version control.
   - Example configuration is documented securely via `.env.example` with placeholders only.
2. **Database Protection**:
   - Parameterized queries via Prisma ORM eliminate SQL injection risks.
   - Separate connection pooler (`pooler.supabase.com`) prevents direct connection exhaustion.
3. **Strict Content Security Policy (CSP)**:
   - Configured in `middleware.ts` with strict `default-src`, `script-src`, `connect-src`, and framed sandboxing.
4. **Role-Based Access Control (RBAC)**:
   - All `/admin` routes and administrative APIs require authenticated sessions with `SUPER_ADMIN` or `ADMIN` roles.
5. **Rate Limiting & Abuse Prevention**:
   - In-memory and IP-based rate limiting on sensitive API endpoints (downloads, search, inquiries).

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/ErGaneshBabu99/erg-platform.git
cd erg-platform/erg-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env.local
```

Key environment variables:
```env
# Database (Use Supabase IPv4 Pooler URLs)
DATABASE_URL="postgresql://postgres.<ref>:<pass>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=30"
DIRECT_URL="postgresql://postgres.<ref>:<pass>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-32-byte-secret"

# Public Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 License

Copyright © 2026 **Er G – Engineering Hub Nepal**. All rights reserved.
Developed by **[Er. Ganesh Chapagain](https://www.erganesh.com.np/about)**.
