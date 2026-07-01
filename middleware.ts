import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH ?? "admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Security headers on all responses
  applySecurityHeaders(response);

  // Admin panel protection
  if (pathname.startsWith(`/${ADMIN_PATH}`)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string;
    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // API rate limiting headers
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    response.headers.set("X-Request-IP", ip);
  }

  return response;
}

function applySecurityHeaders(response: NextResponse) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://vitals.vercel-insights.com https://www.google-analytics.com https://www.clarity.ms",
    "frame-src 'none'",
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
