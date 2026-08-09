import { NextResponse } from "next/server";
import { incrementSiteVisitCount } from "@/lib/site-visits";

export async function POST() {
  try {
    const total = await incrementSiteVisitCount();
    return NextResponse.json({ total });
  } catch {
    // Non-critical (decorative counter) -- fail silently.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
