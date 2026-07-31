import type { AICompletionParams, AIProvider } from "./types";
import { AIProviderHttpError, ProviderNotConfiguredError } from "./types";


const DEFAULT_MODEL = "google/gemma-3-27b-it:free";

export const openrouterProvider: AIProvider = {
  id: "openrouter",
  label: "OpenRouter",

  isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  },

  async complete({ systemPrompt, userPrompt }: AICompletionParams): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new ProviderNotConfiguredError("OpenRouter");

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AIProviderHttpError(response.status, `OpenRouter API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return text;
  },
};
