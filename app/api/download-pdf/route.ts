import { NextRequest, NextResponse } from "next/server";

/**
 * SECURITY FIX (2026-09-10): this route used to `fetch()` any `?url=` value
 * with no validation at all — a classic SSRF hole. Anyone could pass
 * ?url=http://169.254.169.254/... (cloud metadata), an internal service
 * address, or an arbitrary external file and have this server fetch and
 * re-serve it as a PDF.
 *
 * Fix: only allow https:// URLs whose hostname is one of our own trusted
 * PDF hosts (GitHub Releases, which is where our district-rate PDFs live).
 * Add any other legitimate PDF-hosting domain here if you introduce one —
 * never remove this check or make it a substring/prefix match.
 */
const ALLOWED_HOSTNAMES = new Set([
  "github.com",
  "raw.githubusercontent.com",
  "objects.githubusercontent.com", // GitHub Releases assets redirect here
]);

function isAllowedPdfUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return ALLOWED_HOSTNAMES.has(parsed.hostname.toLowerCase());
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") ?? "download.pdf";

  if (!url) {
    return NextResponse.json({ error: "No URL" }, { status: 400 });
  }

  if (!isAllowedPdfUrl(url)) {
    return NextResponse.json(
      { error: "URL not allowed" },
      { status: 403 }
    );
  }

  let response: Response;
  try {
    response = await fetch(url, { redirect: "follow" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  // Verify the upstream actually served a PDF before relabeling it as one.
  const upstreamType = response.headers.get("content-type") ?? "";
  if (!upstreamType.includes("application/pdf") && !upstreamType.includes("octet-stream")) {
    return NextResponse.json({ error: "Upstream file is not a PDF" }, { status: 502 });
  }

  const blob = await response.arrayBuffer();

  // Sanitize the filename to prevent header injection via the `name` param.
  const safeName = name.replace(/[^\w.\- ]/g, "_").slice(0, 150) || "download.pdf";

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
