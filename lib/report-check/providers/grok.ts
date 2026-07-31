import type { AICompletionParams, AIProvider } from "./types";
import { AIProviderHttpError, ProviderNotConfiguredError } from "./types";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const groqProvider: AIProvider = {
  id: "groq",
  label: "Groq",

  isConfigured() {
    return Boolean(process.env.GROQ_API_KEY_REPORT_CHECK);
  },

  async complete({ systemPrompt, userPrompt }: AICompletionParams): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY_REPORT_CHECK;
    if (!apiKey) throw new ProviderNotConfiguredError("Groq");

    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

    // Groq's free tier caps total tokens-per-minute at 12,000 (prompt +
    // completion combined). The shared document-text cap in promptBuilder.ts
    // (~60k chars) is sized for Gemini/OpenRouter, which have far higher
    // limits. Since Groq is only a rare fallback (not the primary path),
    // we trim just this one request further rather than lowering quality
    // for every provider. This only ever shortens the LAST fallback
    // attempt for one batch — it never affects how much of the document
    // gets reviewed overall, since the next "Find Another Issue" call
    // continues from where the review left off either way.
    const MAX_GROQ_PROMPT_CHARS = 20_000; // ~6,000 tokens
    const trimmedUserPrompt =
      userPrompt.length > MAX_GROQ_PROMPT_CHARS
        ? userPrompt.slice(0, MAX_GROQ_PROMPT_CHARS) +
          "\n\n[Document truncated further for this provider's token limit.]"
        : userPrompt;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmedUserPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AIProviderHttpError(response.status, `Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Groq returned an empty response.");
    }

    return text;
  },
};