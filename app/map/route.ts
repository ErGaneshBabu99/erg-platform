import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fallback Route Handler for /map
 * Redirects /map to the static PWA app shell at /map/index.html,
 * preserving any query parameters such as ?route=phidim-sandakpur
 */
export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/map/index.html";
  return NextResponse.redirect(url, 307);
}
