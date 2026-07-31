import type { AIProvider } from "./types";
import { geminiProvider } from "./gemini";
import { claudeProvider } from "./claude";
import { openaiProvider } from "./openai";
import { groqProvider } from "./grok";
import { openrouterProvider } from "./openrouter";

const providers: Record<string, AIProvider> = {
  gemini: geminiProvider,
  claude: claudeProvider,
  openai: openaiProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
};

/**
 * Single configuration switch for which AI provider powers Report Reviewer.
 * Change REPORT_CHECK_AI_PROVIDER in .env to "gemini" | "claude" | "openai" |
 * "grok" | "openrouter" — nothing else in the app needs to change.
 */
export function getAIProvider(): AIProvider {
  const configuredId = (process.env.REPORT_CHECK_AI_PROVIDER || "gemini").toLowerCase();
  const provider = providers[configuredId];

  if (!provider) {
    throw new Error(
      `Unknown REPORT_CHECK_AI_PROVIDER "${configuredId}". Valid options: ${Object.keys(providers).join(", ")}.`
    );
  }

  if (!provider.isConfigured()) {
    throw new Error(
      `AI provider "${provider.label}" is selected but not configured (missing API key in environment).`
    );
  }

  return provider;
}

// Fixed fallback order for the report-check reviewer: Gemini's own model
// chain first, then Grok, then OpenRouter as a last resort. Only providers
// with an API key configured are attempted; each failure (quota, rate
// limit, or any other error) moves to the next provider immediately.
const FALLBACK_CHAIN: AIProvider[] = [geminiProvider, groqProvider, openrouterProvider];
export function getResilientProvider(): AIProvider {
  const chain = FALLBACK_CHAIN.filter((p) => p.isConfigured());

  if (chain.length === 0) {
    throw new Error(
      "No AI provider is configured for Report Reviewer. Set GEMINI_API_KEY, XAI_API_KEY, or OPENROUTER_API_KEY."
    );
  }

  return {
    id: "resilient",
    label: `Resilient (${chain.map((p) => p.label).join(" \u2192 ")})`,
    isConfigured: () => true,
    async complete(params) {
      let lastError: unknown;

      for (const provider of chain) {
        try {
          const result = await provider.complete(params);
          console.log(`[report-check] answered by ${provider.label}`);
          return result;
        } catch (err) {
          lastError = err;
          console.error(`[report-check] provider ${provider.label} failed, trying next`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      throw lastError instanceof Error ? lastError : new Error("All AI providers failed.");
    },
  };
}