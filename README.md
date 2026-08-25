# Er G – Engineering Hub Nepal

> Nepal's Engineering Resource & Consultancy Platform



## Project Structure

```
erg-platform/
├── app/
│   ├── (public)/           # Public-facing pages
│   │   ├── page.tsx        # Homepage
│   │   ├── district-rate/  # District rate listing + detail
│   │   ├── contact/        # Contact page
│   │   └── about/          # About page
│   ├── admin/              # Admin panel (protected)
│   │   ├── page.tsx        # Dashboard
│   │   ├── district-rates/ # CRUD for district rates
│   │   ├── inquiries/      # Contact inquiries
│   │   └── analytics/      # Download & search analytics
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth
│   │   ├── contact/        # Contact form
│   │   └── district-rate/  # Search + download tracking
│   ├── auth/               # Login page
│   ├── sitemap.ts          # Auto-generated XML sitemap
│   └── robots.ts           # robots.txt
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Homepage sections
│   ├── district/           # District rate components
│   └── admin/              # Admin-only components
├── lib/
│   ├── prisma.ts           # Prisma singleton
│   ├── auth.ts             # NextAuth config
│   ├── utils.ts            # Utilities
│   ├── security/           # Rate limiting, audit logging, headers
│   └── validations/        # Zod schemas
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed: 77 districts + admin user
├── middleware.ts            # Auth + security headers
└── docker-compose.yml      # Production Docker setup
```

---

## Security

This platform follows OWASP Top 10 security practices:

- **SQL Injection**: Prisma ORM with parameterized queries
- **XSS**: React's built-in escaping + Content Security Policy
- **CSRF**: NextAuth CSRF tokens + SameSite cookies
- **Rate Limiting**: Per-IP rate limiting on all API routes
- **Input Validation**: Zod schemas on every form and API endpoint
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Password Hashing**: bcrypt (12 rounds)
- **Session Security**: JWT with 24h expiry, secure cookies
- **Audit Logs**: Every admin action is logged with user + IP
- **Role-Based Access**: SUPER_ADMIN, ADMIN, EDITOR, VIEWER
- **Bot Detection**: Honeypot fields on contact forms
- **Admin Protection**: Middleware-protected, session-verified

---

## Adding Future Modules

The architecture is designed for zero-refactoring expansion:

1. **Add Prisma model** in `prisma/schema.prisma`
2. **Add Zod validation** in `lib/validations/`
3. **Add API routes** in `app/api/[module]/`
4. **Add pages** in `app/(public)/[module]/` or `app/admin/[module]/`
5. **Add nav links** in `components/layout/navbar.tsx`

The following placeholder tables are already in the schema:
- `blog_posts` → Engineering Blog
- `vacancies` → Vacancy Portal

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v4 |
| Validation | Zod |
| Forms | React Hook Form |
| Icons | Lucide React |
| Deployment | Vercel / Docker |
| Storage | Cloudflare R2 (recommended) |
| Email | Resend (recommended) |

---


## License

Proprietary – Er G Engineering Hub Nepal. All rights reserved.
