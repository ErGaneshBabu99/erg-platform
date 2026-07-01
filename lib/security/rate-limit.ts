import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier?: (req: NextRequest) => string;
}

export function rateLimit(config: RateLimitConfig) {
  return function (req: NextRequest): NextResponse | null {
    const identifier = config.identifier
      ? config.identifier(req)
      : req.headers.get("x-forwarded-for") ??
        req.headers.get("x-real-ip") ??
        "unknown";

    const key = `rate_limit:${identifier}`;
    const now = Date.now();

    const existing = store.get(key);

    if (!existing || now > existing.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow
    }

    if (existing.count >= config.maxRequests) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((existing.resetTime - now) / 1000)
            ),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(existing.resetTime),
          },
        }
      );
    }

    existing.count++;
    return null; // Allow
  };
}

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
});

export const downloadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
});
