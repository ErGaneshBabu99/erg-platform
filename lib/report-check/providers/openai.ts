import type { AICompletionParams, AIProvider } from "./types";
import { ProviderNotConfiguredError } from "./types";

const DEFAULT_MODEL = "gpt-4o-mini";

export const openaiProvider: AIProvider = {
  id: "openai",
  label: "OpenAI",

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  },

  async complete({ systemPrompt, userPrompt }: AICompletionParams): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new ProviderNotConfiguredError("OpenAI");

    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("OpenAI returned an empty response.");
    }

    return text;
  },
};
