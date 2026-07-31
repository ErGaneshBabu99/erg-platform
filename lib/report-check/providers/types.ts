export interface AICompletionParams {
  systemPrompt: string;
  userPrompt: string;
}

export interface AIProvider {
  /** Machine-readable id, used for logging and the config switch. */
  id: string;
  /** Human-readable name, e.g. for error messages. */
  label: string;
  /** Whether the required API key/env vars are present. */
  isConfigured(): boolean;
  /** Returns the raw text response from the model (expected to be JSON). */
  complete(params: AICompletionParams): Promise<string>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerLabel: string) {
    super(`${providerLabel} is not configured. Missing API key.`);
    this.name = "ProviderNotConfiguredError";
  }
}
export class AIProviderHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AIProviderHttpError";
    this.status = status;
  }
}

export class AIUnavailableError extends Error {
  constructor(message = "AI provider unavailable after retries") {
    super(message);
    this.name = "AIUnavailableError";
  }
}