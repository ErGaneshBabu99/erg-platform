import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH ?? "admin";

// ---------------------------------------------------------------------------
// In-memory IP rate limiter for sensitive API endpoints
// Resets per cold-start (per Worker instance on Cloudflare, per deployment on Vercel)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  "/api/chat":           20,  // max 20 chat requests / IP / minute
  "/api/contact":        5,   // max 5 contact submissions / IP / minute
  "/api/download-pdf":   30,  // max 30 downloads / IP / minute
};

function checkRateLimit(ip: string, pathname: string): boolean {
  const prefix = Object.keys(RATE_LIMITS).find((p) => pathname.startsWith(p));
  if (!prefix) return true; // not a rate-limited route

  const limit = RATE_LIMITS[prefix];
  const now = Date.now();
  const key = `${ip}:${prefix}`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > limit) return false; // blocked
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin panel — currently INACTIVE (returns 404 to everyone) ──────────
  // To re-enable: remove or comment out this block and restore JWT check below.
  if (pathname.startsWith(`/${ADMIN_PATH}`) || pathname.startsWith("/admin")) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();

  // Security headers on all responses
  applySecurityHeaders(response);

  // Safeguard: Prevent Google from indexing workers.dev / pages.dev preview domains
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    req.nextUrl.hostname ||
    "";
  if (host.includes(".workers.dev") || host.includes(".pages.dev")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // API rate limiting
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    response.headers.set("X-Request-IP", ip);

    if (!checkRateLimit(ip, pathname)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  return response;
}

function applySecurityHeaders(response: NextResponse) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://www.google-analytics.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://vitals.vercel-insights.com https://www.google-analytics.com https://www.clarity.ms https://static.cloudflareinsights.com https://cloudflareinsights.com",
    "frame-src 'self' https://docs.google.com https://drive.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
