import type { NextIssueResult, ReviewIssue, ReviewSession } from "./types";
import { getResilientProvider } from "./providers";
import { withRetry } from "./providers/retry";
import { AIUnavailableError } from "./providers/types";
import { SYSTEM_PROMPT, buildUserPrompt, getTotalChunks } from "./promptBuilder";
import {
  reviewBatchSchema,
  reviewCompletionSchema,
  type ReviewIssueParsed,
} from "./validation";
import { sessionStore } from "./sessionStore";

type Logger = (event: Record<string, unknown>) => void;

const FALLBACK_COMPLETION_MESSAGE =
  "No additional issues were found. If you have corrected the previous findings, your document appears to be in good shape. Good luck with your submission.";

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

type ParsedResponse =
  | { kind: "completed"; message: string }
  | { kind: "batch"; issues: ReviewIssueParsed[] }
  | { kind: "invalid" };

function parseModelResponse(raw: string): ParsedResponse {
  const cleaned = stripCodeFences(raw);
  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    return { kind: "invalid" };
  }

  const completion = reviewCompletionSchema.safeParse(json);
  if (completion.success) return { kind: "completed", message: completion.data.message };

  const batch = reviewBatchSchema.safeParse(json);
  if (batch.success) return { kind: "batch", issues: batch.data.issues };

  return { kind: "invalid" };
}

function toReviewIssue(i: ReviewIssueParsed): ReviewIssue {
  return {
    issueId: i.issueId,
    issueNumber: i.issueNumber,
    issueType: i.issueType,
    severity: i.severity,
    confidence: i.confidence,
    title: i.title,
    location: { page: i.location.page ?? null, section: i.location.section ?? null },
    currentText: i.currentText,
    explanation: i.explanation,
    suggestion: i.suggestion,
    category: i.category,
  };
}

/** Calls the AI provider (with retry) and parses the response. Does not
 * touch the session — callers own state mutation. */
async function fetchBatch(session: ReviewSession, logger?: Logger): Promise<ParsedResponse> {
  const provider = getResilientProvider();
  const userPrompt = buildUserPrompt(session);
  const raw = await withRetry(() =>
    provider.complete({ systemPrompt: SYSTEM_PROMPT, userPrompt })
  );
  const parsed = parseModelResponse(raw);
  logger?.({ sessionId: session.id, provider: provider.id, result: parsed.kind });
  return parsed;
}

/**
 * Fire-and-forget: tops up the session's issue queue in the background so
 * the user rarely waits between issues. Silent on failure — a failed
 * prefetch just means the next getNextIssue() call fetches synchronously.
 */

async function fetchNextBatch(session: ReviewSession, logger?: Logger): Promise<ParsedResponse> {
  let current = session;
  const totalChunks = getTotalChunks(current);

  while (true) {
    const parsed = await fetchBatch(current, logger);

    if (parsed.kind !== "completed") return parsed;

    const hasMoreChunks = current.chunkIndex + 1 < totalChunks;
    if (!hasMoreChunks) return parsed;

    const advanced = await sessionStore.update(current.id, { chunkIndex: current.chunkIndex + 1 });
    if (!advanced) return parsed;
    current = advanced;
    logger?.({
      sessionId: current.id,
      result: "advanced_chunk",
      chunkIndex: current.chunkIndex,
      totalChunks,
    });
  }
}

export async function maybePrefetch(sessionId: string, logger?: Logger): Promise<void> {
  const session = await sessionStore.get(sessionId);
  if (!session || session.completed || session.fetchInProgress) return;
  if (session.issueQueue.length > 1) return;

  await sessionStore.update(sessionId, { fetchInProgress: true });

  try {
    const parsed = await fetchNextBatch(session, logger);
    const fresh = await sessionStore.get(sessionId);
    if (!fresh) return;

    if (parsed.kind === "batch") {
      const newIssues = parsed.issues
        .filter(
          (i) =>
            !fresh.reportedIssueIds.includes(i.issueId) &&
            !fresh.issueQueue.some((q) => q.issueId === i.issueId)
        )
        .map(toReviewIssue);

      await sessionStore.update(sessionId, {
        issueQueue: [...fresh.issueQueue, ...newIssues],
        nextIssueNumber: fresh.nextIssueNumber + newIssues.length,
        fetchInProgress: false,
      });
    } else if (parsed.kind === "completed" && fresh.issueQueue.length === 0) {
      await sessionStore.update(sessionId, { completed: true, fetchInProgress: false });
    } else {
      await sessionStore.update(sessionId, { fetchInProgress: false });
    }
  } catch {
    // Background prefetch failures are silent by design — the user isn't
    // blocked by this; a foreground call will retry when the queue empties.
    await sessionStore.update(sessionId, { fetchInProgress: false });
  }
}

/**
 * Returns the next issue for the session — instantly from the cached queue
 * when available, otherwise fetches a fresh batch (with retry). On
 * persistent AI unavailability, the session is left untouched and a
 * `{ completed: false, status: "unavailable" }` result is returned so the
 * caller can offer a Retry button without losing the uploaded document.
 */
export async function getNextIssue(session: ReviewSession, logger?: Logger): Promise<NextIssueResult> {
  // 1) Serve instantly from cache.
  if (session.issueQueue.length > 0) {
    const [issue, ...rest] = session.issueQueue;
    await sessionStore.update(session.id, {
      issueQueue: rest,
      reportedIssueIds: [...session.reportedIssueIds, issue.issueId],
    });
    // Top up the queue in the background — don't await.
    void maybePrefetch(session.id, logger);
    return { completed: false, issue };
  }

  if (session.completed) {
    return { completed: true, message: FALLBACK_COMPLETION_MESSAGE };
  }

  // 2) Cache empty — fetch synchronously.
  try {
    const parsed = await fetchNextBatch(session, logger);

    if (parsed.kind === "completed") {
      await sessionStore.update(session.id, { completed: true });
      return { completed: true, message: parsed.message };
    }

    if (parsed.kind === "batch") {
      const fresh = (await sessionStore.get(session.id)) ?? session;
      const newIssues = parsed.issues
        .filter((i) => !fresh.reportedIssueIds.includes(i.issueId))
        .map(toReviewIssue);

      if (newIssues.length === 0) {
        // Model only returned duplicates — end gracefully rather than loop.
        await sessionStore.update(session.id, { completed: true });
        return { completed: true, message: FALLBACK_COMPLETION_MESSAGE };
      }

      const [first, ...rest] = newIssues;
      await sessionStore.update(session.id, {
        issueQueue: rest,
        reportedIssueIds: [...fresh.reportedIssueIds, first.issueId],
        nextIssueNumber: fresh.nextIssueNumber + newIssues.length,
      });
      return { completed: false, issue: first };
    }

    // Invalid JSON from the model — end gracefully rather than surface it.
    await sessionStore.update(session.id, { completed: true });
    return {
      completed: true,
      message:
        "We couldn't find any further issues to report reliably. If you'd like a deeper pass, please try again.",
    };
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      logger?.({ sessionId: session.id, result: "unavailable", underlyingError: err.message });
      // Session is left completely untouched — safe to retry.
      return { completed: false, status: "unavailable" };
    }
    throw err;
  }
}