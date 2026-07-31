import type { AICompletionParams, AIProvider } from "./types";
import { AIProviderHttpError, ProviderNotConfiguredError } from "./types";

const DEFAULT_MODEL_CHAIN = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

function getModelChain(): string[] {
  const configured = process.env.GEMINI_MODEL;
  if (!configured) return DEFAULT_MODEL_CHAIN;
  const list = configured
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_MODEL_CHAIN;
}

// Multiple Gemini API keys, each with its own daily quota. GEMINI_API_KEY_1
// through GEMINI_API_KEY_5 are tried in order; GEMINI_API_KEY (no suffix)
// is kept as a fallback for backward compatibility if no numbered keys are
// set. Each key runs the full model chain above before moving to the next
// key, so a single key is only abandoned once every model on it is
// quota-exhausted.
function getApiKeys(): string[] {
  const numbered = [1, 2, 3, 4, 5]
    .map((n) => process.env[`GEMINI_API_KEY_${n}`])
    .filter((k): k is string => Boolean(k));
  if (numbered.length) return numbered;
  const legacy = process.env.GEMINI_API_KEY;
  return legacy ? [legacy] : [];
}

async function callGemini(
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new AIProviderHttpError(response.status, `Gemini API error (${response.status}) [${model}]: ${errText}`);
  }

  const data = await response.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? undefined;

  if (!text) {
    throw new Error(`Gemini (${model}) returned an empty response.`);
  }

  return text;
}

export const geminiProvider: AIProvider = {
  id: "gemini",
  label: "Gemini",

  isConfigured() {
    return getApiKeys().length > 0;
  },

  async complete({ systemPrompt, userPrompt }: AICompletionParams): Promise<string> {
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) throw new ProviderNotConfiguredError("Gemini");

    const modelChain = getModelChain();
    let lastQuotaError: AIProviderHttpError | null = null;

    for (const apiKey of apiKeys) {
      for (const model of modelChain) {
        try {
          return await callGemini(model, apiKey, systemPrompt, userPrompt);
        } catch (err) {
         if (
  err instanceof AIProviderHttpError &&
  (err.status === 429 || err.status === 404)
) {
  lastQuotaError = err;
  continue;
}
          throw err;
        }
      }
    }

    throw (
      lastQuotaError ??
      new AIProviderHttpError(429, "All Gemini keys/models in the fallback chain are quota-exhausted.")
    );
  },
};