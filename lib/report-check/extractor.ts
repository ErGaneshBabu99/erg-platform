import type { ExtractedDocument, ExtractedSection, SupportedFileType } from "./types";
import { ExtractionError } from "./types";

// Heuristic heading detector for plain-text extracted from PDFs (which have
// no semantic markup by the time we see them). Matches things like:
//   "1.6 Literature Review", "Chapter 3: Methodology", "CONCLUSION"
// This is intentionally conservative — false negatives (missing a heading)
// are far less harmful here than false positives that would fragment normal
// sentences into fake "sections".
const HEADING_PATTERNS: RegExp[] = [
  /^\d+(\.\d+)*\s+[A-Z][A-Za-z0-9 ,'&()-]{2,80}$/, // "1.6 Literature Review"
  /^chapter\s+\d+[:\s]/i, // "Chapter 3: Methodology"
  /^[A-Z][A-Z0-9 &()-]{4,60}$/, // "CONCLUSION AND RECOMMENDATIONS"
];

function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 90) return false;
  return HEADING_PATTERNS.some((re) => re.test(trimmed));
}

function buildPromptText(sections: ExtractedSection[]): string {
  return sections
    .map((s) => {
      const tag = [
        s.page !== null ? `page=${s.page}` : null,
        s.heading ? `section="${s.heading}"` : null,
      ]
        .filter(Boolean)
        .join(" ");
      return `[${tag || "content"}]\n${s.text}`;
    })
    .join("\n\n");
}

async function extractPdf(buffer: Buffer, fileName: string): Promise<ExtractedDocument> {
  // pdf-parse wraps pdfjs-dist. Its `pagerender` hook lets us capture text
  // page-by-page so we can preserve page numbers, which the review output
  // depends on.
  const pdfParse = (await import("pdf-parse")).default;

  const pageTexts: string[] = [];

  let result;
  try {
    result = await pdfParse(buffer, {
      pagerender: async (pageData: any) => {
        const textContent = await pageData.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        pageTexts.push(text);
        return text;
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || err).toLowerCase();
    if (msg.includes("password") || msg.includes("encrypted")) {
      throw new ExtractionError(
        "PASSWORD_PROTECTED",
        "This PDF is password-protected. Please remove the password and upload again."
      );
    }
    throw new ExtractionError(
      "CORRUPTED_FILE",
      "This PDF could not be read. It may be corrupted or in an unsupported format."
    );
  }

  const pageCount = result.numpages ?? pageTexts.length;
  const totalChars = pageTexts.reduce((sum, t) => sum + t.trim().length, 0);

  if (totalChars === 0) {
    // Zero extractable text across every page almost always means a
    // scanned/image-only PDF (no OCR text layer).
    throw new ExtractionError(
      "IMAGE_ONLY_PDF",
      "No selectable text was found in this PDF. It appears to be a scanned/image-only document, which isn't supported yet."
    );
  }

  const sections: ExtractedSection[] = [];
  let currentHeading: string | null = null;

  pageTexts.forEach((rawPageText, idx) => {
    const pageNum = idx + 1;
    const lines = rawPageText
      .split(/\n|(?<=[.?!])\s{2,}/)
      .map((l) => l.trim())
      .filter(Boolean);

    let buffer: string[] = [];
    const flush = () => {
      if (buffer.length) {
        sections.push({ heading: currentHeading, page: pageNum, text: buffer.join(" ") });
        buffer = [];
      }
    };

    if (lines.length === 0) return;

    for (const line of lines) {
      if (looksLikeHeading(line)) {
        flush();
        currentHeading = line;
        continue;
      }
      buffer.push(line);
    }
    flush();
  });

  const promptText = buildPromptText(sections);

  return {
    fileType: "pdf",
    fileName,
    pageCount,
    sections,
    promptText,
    charCount: promptText.length,
  };
}

async function extractDocx(buffer: Buffer, fileName: string): Promise<ExtractedDocument> {
  const mammoth = await import("mammoth");

  let html: string;
  try {
    const result = await mammoth.convertToHtml({ buffer });
    html = result.value;
  } catch (err) {
    throw new ExtractionError(
      "CORRUPTED_FILE",
      "This DOCX file could not be read. It may be corrupted or in an unsupported format."
    );
  }

  if (!html || html.replace(/<[^>]+>/g, "").trim().length === 0) {
    throw new ExtractionError(
      "EMPTY_DOCUMENT",
      "The document appears to be empty — no content was found to review."
    );
  }

  // Mammoth emits headings as <h1>-<h6> and body copy as <p>/<table>. Walk
  // the tags in order to rebuild a heading -> paragraph structure. DOCX has
  // no fixed "pages" until rendered, so page is always null here.
  const sections: ExtractedSection[] = [];
  let currentHeading: string | null = null;

  const blockRegex = /<(h[1-6]|p|li|td)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    if (tag.startsWith("h")) {
      currentHeading = text;
      continue;
    }
    sections.push({ heading: currentHeading, page: null, text });
  }

  if (sections.length === 0) {
    throw new ExtractionError(
      "EMPTY_DOCUMENT",
      "The document appears to be empty — no content was found to review."
    );
  }

  const promptText = buildPromptText(sections);

  return {
    fileType: "docx",
    fileName,
    pageCount: null,
    sections,
    promptText,
    charCount: promptText.length,
  };
}

export async function extractDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedDocument> {
  const lowerName = fileName.toLowerCase();
  const fileType: SupportedFileType | null =
    mimeType === "application/pdf" || lowerName.endsWith(".pdf")
      ? "pdf"
      : mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          lowerName.endsWith(".docx")
        ? "docx"
        : null;

  if (!fileType) {
    throw new ExtractionError(
      "UNSUPPORTED_FILE",
      "Only PDF and DOCX files are supported."
    );
  }

  try {
    return fileType === "pdf"
      ? await extractPdf(buffer, fileName)
      : await extractDocx(buffer, fileName);
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError(
      "EXTRACTION_FAILED",
      "Something went wrong while reading this document. Please try again."
    );
  }
}
