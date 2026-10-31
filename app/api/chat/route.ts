import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";

const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-4-argon",
  "gemini-flash-latest",
];

function getGeminiApiKeys(): string[] {
  const numbered = [1, 2, 3, 4, 5]
    .map((n) => process.env[`GEMINI_API_KEY_${n}`])
    .filter((k): k is string => Boolean(k));
  if (numbered.length > 0) return numbered;
  const legacy = process.env.GEMINI_API_KEY;
  return legacy ? [legacy] : [];
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function requestGroq(apiKey: string, model: string, messages: ChatMessage[]): Promise<string | null> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        max_tokens: 850,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Groq ${model}] HTTP ${response.status}:`, errText.slice(0, 160));
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.warn(`[Groq ${model}] Network/Fetch error:`, err);
    return null;
  }
}

async function requestGemini(apiKey: string, model: string, messages: ChatMessage[]): Promise<string | null> {
  try {
    const contents = messages
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Ensure contents starts with a 'user' message as required by Gemini API
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 850,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Gemini ${model}] HTTP ${response.status}:`, errText.slice(0, 160));
      return null;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ?? null;
    return text && text.trim().length > 0 ? text : null;
  } catch (err) {
    console.warn(`[Gemini ${model}] Network/Fetch error:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKeys = getGeminiApiKeys();

    // 1. Try Groq models first if GROQ_API_KEY is configured
    if (groqKey) {
      for (const model of GROQ_MODELS) {
        const text = await requestGroq(groqKey, model, messages);
        if (text) {
          return NextResponse.json({ text });
        }
      }
    }

    // 2. Fall back to Google Gemini models (with key rotation)
    if (geminiKeys.length > 0) {
      for (const apiKey of geminiKeys) {
        for (const model of GEMINI_MODELS) {
          const text = await requestGemini(apiKey, model, messages);
          if (text) {
            return NextResponse.json({ text });
          }
        }
      }
    }

    // 3. Graceful fallback if both AI services are temporarily unreachable
    return NextResponse.json({
      text: "नमस्ते! अहिले सर्भरमा अत्यधिक ट्राफिक भएकाले जवाफ दिन केही ढिलाइ भएको छ। कृपया केही क्षणपछि फेरि सोध्नुहोला वा /contact मार्फत सिधै सम्पर्क गर्नुहोस्। धन्यवाद!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat route error:", message);
    return NextResponse.json({
      text: "नमस्ते! केही प्राविधिक समस्या उत्पन्न भएको छ। कृपया केही बेरमा पुनः प्रयास गर्नुहोस् वा /contact मार्फत इन्जिनियर गणेशलाई सिधै सम्पर्क गर्नुहोस्।",
    });
  }
}
