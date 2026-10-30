import { NextRequest, NextResponse } from "next/server";

/**
 * PDF Download Proxy
 *
 * Fetches district-rate PDFs hosted on GitHub Releases and streams the final asset
 * back to the client with long-lived edge cache headers.
 *
 * Key features:
 * - Follows upstream redirects on the server (GitHub releases redirect to AWS S3/objects.githubusercontent.com)
 * - Returns the final PDF directly so Cloudflare Edge caches the actual binary, not a 302 redirect
 * - Sets long-term Cache-Control (public, max-age=31536000, immutable)
 * - Forwards Range headers to support resumed and chunked PDF downloads (HTTP 206)
 * - SSRF protection: restricts requests strictly to verified GitHub domains
 * - Handles both GET and HEAD requests
 */
const ALLOWED_HOSTNAMES = new Set([
  "github.com",
  "raw.githubusercontent.com",
  "objects.githubusercontent.com",
  "github-production-release-asset-2e65be.s3.amazonaws.com",
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

function getCleanFilename(rawUrl: string, requestedFilename?: string | null): string {
  if (requestedFilename && requestedFilename.trim()) {
    return requestedFilename.trim().replace(/[^a-zA-Z0-9_.-]/g, "_");
  }
  try {
    const parsed = new URL(rawUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.toLowerCase().endsWith(".pdf")) {
      return decodeURIComponent(last).replace(/[^a-zA-Z0-9_.-]/g, "_");
    }
  } catch {
    // Fallback
  }
  return "district-rate.pdf";
}

export async function GET(req: NextRequest): Promise<Response> {
  return handlePdfRequest(req, false);
}

export async function HEAD(req: NextRequest): Promise<Response> {
  return handlePdfRequest(req, true);
}

async function handlePdfRequest(req: NextRequest, isHead: boolean): Promise<Response> {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedPdfUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    // Forward Range header if requested by client (for partial/chunked PDF loading)
    const range = req.headers.get("range");
    if (range) {
      headers["range"] = range;
    }

    // Fetch upstream asset, actively following redirects to reach the final binary
    const upstreamRes = await fetch(url, {
      method: isHead ? "HEAD" : "GET",
      headers,
      redirect: "follow",
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: `Upstream storage responded with status ${upstreamRes.status}` },
        { status: upstreamRes.status === 404 ? 404 : 502 }
      );
    }

    const cleanFilename = getCleanFilename(url, filename);
    const responseHeaders = new Headers();

    // Cache final PDF heavily at Cloudflare edge and client browser
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    responseHeaders.set("Content-Type", "application/pdf");
    responseHeaders.set("Content-Disposition", `attachment; filename="${cleanFilename}"`);
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    if (isHead) {
      return new Response(null, {
        status: upstreamRes.status,
        headers: responseHeaders,
      });
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[download-pdf] upstream error:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDF from upstream storage" },
      { status: 502 }
    );
  }
}
