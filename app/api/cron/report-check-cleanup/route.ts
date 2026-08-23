import { list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Safety net for the upload route's own cleanup (which deletes each blob
// right after it's processed). Catches anything left behind by a crashed
// request, a killed dev server, etc. Same 2-hour cutoff as the report
// session TTL — a blob has no reason to outlive its session.
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  // Vercel Cron sends this header automatically when CRON_SECRET is set on
  // the project — rejects anyone else from triggering mass deletes.
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = Date.now() - MAX_AGE_MS;
  let deleted = 0;
  let checked = 0;
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: "report-check/", cursor, limit: 1000 });
    checked += page.blobs.length;

    const stale = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff);
    if (stale.length) {
      await Promise.allSettled(stale.map((b) => del(b.url)));
      deleted += stale.length;
    }

    cursor = page.cursor;
  } while (cursor);

  console.log("[report-check] cleanup cron", { checked, deleted });
  return NextResponse.json({ checked, deleted });
}
