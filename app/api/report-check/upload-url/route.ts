import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { ALL_ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/report-check/validation";

// Same limiter shape as the (now lightweight) upload route — this is the
// request that actually gates who can push bytes into our Blob store.
const reportCheckUploadUrlRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
});

// Issues a short-lived, scoped token that lets the browser upload a file
// straight to Vercel Blob storage — the request never passes through our
// serverless function, so it isn't subject to Vercel's ~4.5MB function
// body limit. Files land under "report-check/" so the cleanup cron
// (app/api/cron/report-check-cleanup) can safely sweep only these.
export async function POST(request: Request): Promise<NextResponse> {
  const limited = reportCheckUploadUrlRateLimit(request as any);
  if (limited) return limited;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("report-check/")) {
          throw new Error("Invalid upload path.");
        }
        return {
          allowedContentTypes: ALL_ALLOWED_MIME_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: false, // pathname already includes a uuid
        };
      },
      // Fires as a webhook from Vercel once the upload finishes. Not used
      // for anything critical (extraction happens in the /upload route,
      // triggered by the client right after this promise resolves) — note
      // it will not fire on localhost since Vercel can't reach it there,
      // but the direct browser→Blob upload itself works fine locally too.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not prepare upload." },
      { status: 400 }
    );
  }
}
