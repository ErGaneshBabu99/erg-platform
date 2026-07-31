import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { sessionStore } from "@/lib/report-check/sessionStore";
import { getNextIssue } from "@/lib/report-check/reviewer";

export const runtime = "nodejs";
export const maxDuration = 60;

const reportCheckNextIssueRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

export async function POST(req: NextRequest) {
  const limited = reportCheckNextIssueRateLimit(req);
  if (limited) return limited;

  const startedAt = Date.now();

  try {
    const body = await req.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const session = await sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "This review session has expired. Please upload the document again." },
        { status: 404 }
      );
    }

    const result = await getNextIssue(session, (event) => {
      console.log("[report-check]", event);
    });

    console.log("[report-check] next-issue", {
      sessionId,
      processingMs: Date.now() - startedAt,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[report-check] next-issue error", {
      error: err?.message || String(err),
    });
    return NextResponse.json(
      { error: "Something went wrong while finding the next issue. Please try again." },
      { status: 500 }
    );
  }
}
