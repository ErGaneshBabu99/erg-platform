import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { extractDocument } from "@/lib/report-check/extractor";
import { ExtractionError } from "@/lib/report-check/types";
import { validateFile } from "@/lib/report-check/validation";
import { sessionStore } from "@/lib/report-check/sessionStore";
import { getNextIssue } from "@/lib/report-check/reviewer";

export const runtime = "nodejs";
export const maxDuration = 60;

const reportCheckUploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
});

const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  EMPTY_DOCUMENT: { status: 422, message: "This document appears to be empty." },
  PASSWORD_PROTECTED: {
    status: 422,
    message: "This PDF is password-protected. Please remove the password and try again.",
  },
  CORRUPTED_FILE: {
    status: 422,
    message: "This file could not be read. It may be corrupted or in an unsupported format.",
  },
  UNSUPPORTED_FILE: { status: 415, message: "Only PDF and DOCX files are supported." },
  IMAGE_ONLY_PDF: {
    status: 422,
    message:
      "No selectable text was found in this PDF. Scanned/image-only PDFs aren't supported yet.",
  },
  FILE_TOO_LARGE: { status: 413, message: "File is too large. Maximum size is 4MB." },
  EXTRACTION_FAILED: {
    status: 500,
    message: "Something went wrong while reading this document. Please try again.",
  },
};

export async function POST(req: NextRequest) {
  const limited = reportCheckUploadRateLimit(req);
  if (limited) return limited;

  const startedAt = Date.now();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }

  const fileCheck = validateFile({ type: file.type, size: file.size, name: file.name });
  if (!fileCheck.ok) {
    const mapped = ERROR_MESSAGES[fileCheck.code];
    return NextResponse.json({ error: mapped.message, code: fileCheck.code }, { status: mapped.status });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let extracted;
    try {
      extracted = await extractDocument(buffer, file.type, file.name);
    } catch (err) {
      if (err instanceof ExtractionError) {
        const mapped = ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.EXTRACTION_FAILED;
        return NextResponse.json({ error: mapped.message, code: err.code }, { status: mapped.status });
      }
      throw err;
    }

    console.log("[report-check] extracted", {
      charCount: extracted.charCount,
      sections: extracted.sections.length,
      sample: extracted.promptText.slice(0, 200),
    });

    const session = await sessionStore.create({
      fileName: file.name,
      fileType: extracted.fileType,
      pageCount: extracted.pageCount,
      extracted,
    });

    const result = await getNextIssue(session, (event) => {
      console.log("[report-check]", {
        ...event,
        pageCount: extracted.pageCount,
        fileType: extracted.fileType,
      });
    });

    console.log("[report-check] upload", {
      sessionId: session.id,
      pageCount: extracted.pageCount,
      fileType: extracted.fileType,
      processingMs: Date.now() - startedAt,
    });

    return NextResponse.json({ sessionId: session.id, ...result });
  } catch (err: any) {
    console.error("[report-check] upload error", { error: err?.message || String(err) });
    return NextResponse.json(
      { error: "Something went wrong while processing your document. Please try again." },
      { status: 500 }
    );
  }
}
