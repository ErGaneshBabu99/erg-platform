import type { AICompletionParams, AIProvider } from "./types";
import { ProviderNotConfiguredError } from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-6";

export const claudeProvider: AIProvider = {
  id: "claude",
  label: "Claude",

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async complete({ systemPrompt, userPrompt }: AICompletionParams): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new ProviderNotConfiguredError("Claude");

    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.content
      ?.filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("");

    if (!text) {
      throw new Error("Claude returned an empty response.");
    }

    return text;
  },
};
