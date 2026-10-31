import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const primaryModel = "llama-3.3-70b-versatile";
    const fallbackModel = "llama-3.1-8b-instant";

    const makeGroqRequest = async (model: string) => {
      return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 700,
          temperature: 0.7,
        }),
      });
    };

    let response = await makeGroqRequest(primaryModel);

    if (!response.ok) {
      console.warn(
        `Groq primary model (${primaryModel}) failed with status ${response.status}. Retrying fallback (${fallbackModel})...`
      );
      response = await makeGroqRequest(fallbackModel);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content ??
      "Namaste! Could not generate a response right now. Please try asking again.";

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat route error:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
