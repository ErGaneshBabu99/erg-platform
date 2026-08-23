import { z } from "zod";

// ---- Upload constraints ----
// v3: uploads go straight to our server route as multipart form data
// (no separate blob storage step). Kept at 4MB, safely under Vercel's
// 4.5MB serverless function request body limit. Files over this are
// compressed client-side before upload; if they still don't fit, the
// user is told clearly instead of a generic failure.
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

// Target we try to compress large PDFs down to before giving up.
export const COMPRESS_TARGET_BYTES = MAX_FILE_SIZE_BYTES;

export const ALLOWED_MIME_TYPES = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

export const ALL_ALLOWED_MIME_TYPES: string[] = [
  ...ALLOWED_MIME_TYPES.pdf,
  ...ALLOWED_MIME_TYPES.docx,
];

// Cap how much extracted text we send to the AI provider per request.
// Keeps prompt cost/latency bounded for very large documents in v1.
export const MAX_PROMPT_CHARS = 60_000;

// ---- AI response schemas ----
// Mirrors the exact flat-JSON shape the system prompt instructs the model to
// return (see promptBuilder.ts) — either a single issue object, or a
// completion object.

export const reviewIssueSchema = z.object({
  issueId: z.string().min(1).max(200),
  issueNumber: z.number().int().positive(),
  issueType: z.string().min(1).max(100),
  severity: z.enum(["Low", "Medium", "High"]),
  confidence: z.number().min(0).max(1),
  title: z.string().min(1).max(200),
  location: z.object({
    page: z.number().int().positive().nullable().optional().default(null),
    section: z.string().max(300).nullable().optional().default(null),
  }),
  currentText: z.string().max(2000),
  explanation: z.string().min(1).max(2000),
  suggestion: z.string().min(1).max(2000),
  category: z.string().min(1).max(100),
});

export const reviewCompletionSchema = z.object({
  completed: z.literal(true),
  message: z.string().min(1).max(1000),
});

export const reviewBatchSchema = z.object({
  issues: z.array(reviewIssueSchema).min(1).max(3),
});

export type ReviewIssueParsed = z.infer<typeof reviewIssueSchema>;

export function validateFile(file: { type: string; size: number; name: string }) {
  if (file.size === 0) {
    return { ok: false as const, code: "EMPTY_DOCUMENT" as const };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false as const, code: "FILE_TOO_LARGE" as const };
  }
  if (!ALL_ALLOWED_MIME_TYPES.includes(file.type)) {
    // Fall back to extension sniffing — some browsers/OSes send generic
    // mime types (e.g. "application/octet-stream") for docx.
    const lower = file.name.toLowerCase();
    const looksLikePdf = lower.endsWith(".pdf");
    const looksLikeDocx = lower.endsWith(".docx");
    if (!looksLikePdf && !looksLikeDocx) {
      return { ok: false as const, code: "UNSUPPORTED_FILE" as const };
    }
  }
  return { ok: true as const };
}
