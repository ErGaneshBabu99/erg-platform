import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are an AI assistant for Er G – Engineering Hub Nepal (erg.com.np), built by Ganesh Chapagain, a registered civil engineer from Nepal.

You are an expert in:
- Civil engineering (structural, highway, hydraulics, geotechnical)
- Construction estimation and BOQ preparation
- Rate analysis and district rates in Nepal
- Hydropower engineering
- Bridge and road design
- Water supply and irrigation
- AutoCAD and engineering software
- Nepal government engineering standards (DoR, DoLIDAR, DUDBC)
- Engineering career guidance in Nepal
- Fiscal year district rates for all 77 districts of Nepal

Important context:
- District rates are published annually by the Government of Nepal for each district
- Er G provides free PDF downloads of district rates at erg.com.np/district-rate
- The current fiscal year is 2083/84 (Nepali) / 2026-27 (AD)
- You need to answer in English language

Rules:
- Answer concisely but completely
- Use simple language, avoid unnecessary jargon
- If asked something unrelated to engineering, politely redirect to your expertise
- Never make up specific rate numbers — direct users to the official district rate PDFs on erg.com.np
- For complex consultancy needs, suggest contacting via erg.com.np/contact
- Keep responses under 250 words unless detailed explanation is genuinely needed`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // Convert messages to Gemini format
    // Gemini uses "user" and "model" roles (not "assistant")
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
  const error = await response.text();

  console.error("Gemini API error:", error);

  return NextResponse.json(
    {
      error,
    },
    { status: response.status }
  );
}

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, could not generate a response.";

    return NextResponse.json({ text });
  } catch (err: any) {
  console.error("Chat route error:", err);

  return NextResponse.json(
    {
      error: err?.message || String(err),
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    },
    { status: 500 }
  );
}
}
