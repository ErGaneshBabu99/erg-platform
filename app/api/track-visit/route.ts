import { NextRequest, NextResponse } from "next/server";
import { incrementSiteVisitCount } from "@/lib/site-visits";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "erg_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(req: NextRequest) {
  try {
    const total = await incrementSiteVisitCount();

    // Best-effort page-view log for the admin analytics dashboard. Kept
    // separate from the counter above so a failure here never breaks the
    // existing "total views" display used elsewhere on the site.
    try {
      const body = await req.json().catch(() => ({}));
      const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";

      let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
      const isNewVisitor = !visitorId;
      if (!visitorId) visitorId = crypto.randomUUID();

      await prisma.pageView.create({
        data: {
          path,
          visitorId,
          referer: req.headers.get("referer")?.slice(0, 500) || null,
        },
      });

      const res = NextResponse.json({ total });
      if (isNewVisitor) {
        res.cookies.set(VISITOR_COOKIE, visitorId, {
          maxAge: VISITOR_COOKIE_MAX_AGE,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        });
      }
      return res;
    } catch (err) {
      console.error("[analytics] page view log failed", { error: (err as Error)?.message });
      return NextResponse.json({ total });
    }
  } catch {
    // Non-critical (decorative counter) -- fail silently.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
