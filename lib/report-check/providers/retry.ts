import { AIProviderHttpError, AIUnavailableError } from "./types";

const RETRY_DELAYS_MS = [2000, 5000, 10000];

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof AIProviderHttpError && (err.status === 429 || err.status === 503);
      const hasDelaysLeft = attempt < RETRY_DELAYS_MS.length;

      if (!isRetryable || !hasDelaysLeft) break;

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  throw new AIUnavailableError(lastError instanceof Error ? lastError.message : String(lastError));
}