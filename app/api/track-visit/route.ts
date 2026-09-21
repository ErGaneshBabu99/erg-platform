import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { incrementSiteVisitCount } from "@/lib/site-visits";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "erg_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Fire-and-forget analytics endpoint. Nothing on the client ever reads this
 * route's response body (site-visit-tracker.tsx does `fetch(...).catch(...)`
 * and never calls `.json()`), so there is zero reason to make the browser
 * wait on either DB write. We compute the visitor cookie synchronously
 * (no DB needed for that), respond immediately, then perform both writes
 * via `after()` -- which runs them after the response has already been
 * streamed back, using the same request's serverless invocation lifetime
 * (Vercel's `waitUntil` under the hood) so they still reliably complete
 * without holding the response open.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
  const referer = req.headers.get("referer")?.slice(0, 500) || null;

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  const isNewVisitor = !visitorId;
  if (!visitorId) visitorId = crypto.randomUUID();

  const res = NextResponse.json({ ok: true });
  if (isNewVisitor) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  after(async () => {
    // Two independent try/catches, same as before: a failure in one write
    // must never suppress the other or throw inside after() unhandled.
    try {
      await incrementSiteVisitCount();
    } catch (err) {
      console.error("[analytics] site visit increment failed", {
        error: (err as Error)?.message,
      });
    }
    try {
      await prisma.pageView.create({
        data: { path, visitorId, referer },
      });
    } catch (err) {
      console.error("[analytics] page view log failed", {
        error: (err as Error)?.message,
      });
    }
  });

  return res;
}
