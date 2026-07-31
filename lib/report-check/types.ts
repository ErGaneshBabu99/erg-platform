// AI Report Reviewer — shared types
// Kept separate from validation.ts (zod) so non-validation code can import
// plain types without pulling in zod.

export type ReviewSeverity = "Low" | "Medium" | "High";

export interface ReviewIssue {
  issueId: string;
  issueNumber: number;
  issueType: string;
  severity: ReviewSeverity;
  confidence: number;
  title: string;
  location: {
    page: number | null;
    section: string | null;
  };
  currentText: string;
  explanation: string;
  suggestion: string;
  category: string;
}

export interface ReviewCompletion {
  completed: true;
  message: string;
}

export type NextIssueResult =
  | { completed: false; issue: ReviewIssue }
  | { completed: false; status: "unavailable" }
  | ReviewCompletion;

// ---- Document extraction ----

export type SupportedFileType = "pdf" | "docx";

export interface ExtractedSection {
  /** Nearest heading/section title above this chunk of text, if detected. */
  heading: string | null;
  /** Page number this chunk belongs to. Always available for PDF; null for DOCX. */
  page: number | null;
  text: string;
}

export interface ExtractedDocument {
  fileType: SupportedFileType;
  fileName: string;
  /** Total page count. Known for PDF; null for DOCX (page-less format). */
  pageCount: number | null;
  sections: ExtractedSection[];
  /** Full plain text, section-tagged, ready to feed to the AI provider. */
  promptText: string;
  charCount: number;
}

// ---- Extraction errors ----

export type ExtractionErrorCode =
  | "EMPTY_DOCUMENT"
  | "PASSWORD_PROTECTED"
  | "CORRUPTED_FILE"
  | "UNSUPPORTED_FILE"
  | "IMAGE_ONLY_PDF"
  | "FILE_TOO_LARGE"
  | "EXTRACTION_FAILED";

export class ExtractionError extends Error {
  code: ExtractionErrorCode;

  constructor(code: ExtractionErrorCode, message: string) {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

// ---- Session ----

export interface ReviewSession {
  id: string;
  createdAt: number;
  expiresAt: number;
  fileName: string;
  fileType: SupportedFileType;
  pageCount: number | null;
  extracted: ExtractedDocument;
  reportedIssueIds: string[];
  nextIssueNumber: number;
  completed: boolean;
  issueQueue: ReviewIssue[];
  fetchInProgress: boolean;/** Which slice of the (possibly very long) document we're currently reviewing. */
  chunkIndex: number;
}

export interface CreateSessionInput {
  fileName: string;
  fileType: SupportedFileType;
  pageCount: number | null;
  extracted: ExtractedDocument;
}

export interface SessionStore {
  create(input: CreateSessionInput): Promise<ReviewSession>;
  get(id: string): Promise<ReviewSession | null>;
  update(id: string, patch: Partial<ReviewSession>): Promise<ReviewSession | null>;
  delete(id: string): Promise<void>;
}
