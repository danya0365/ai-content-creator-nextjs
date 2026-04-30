import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ai/photo-content?theme=hadith
 * Generates random Arabic text, Thai translation, and source reference
 * based on the selected photo prompt theme.
 *
 * ✅ Standalone route — does NOT modify IContentService interface
 * ✅ Uses the same AI provider configured via AI_PROVIDER env var
 */

type AIProvider = "gemini" | "groq" | "openrouter" | "wavespeed" | "mock";

const THEME_PROMPTS: Record<string, { system: string; user: string }> = {
  hadith: {
    system: `คุณคือผู้เชี่ยวชาญด้านหะดีษ (Hadith) ของท่านนบีมุฮัมมัด ﷺ
คุณต้องสุ่มหะดีษที่มีชื่อเสียง 1 บท ที่แตกต่างกันทุกครั้ง
ให้ข้อความอาหรับต้นฉบับ คำแปลภาษาไทยที่ถูกต้อง และแหล่งอ้างอิง

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{"arabicText": "...", "translationText": "...", "sourceReference": "..."}
ห้ามตอบนอกรูปแบบนี้ ห้ามมี markdown ห้ามมีคำอธิบายเพิ่มเติม`,
    user: "สุ่มหะดีษที่มีชื่อเสียง 1 บท ที่ให้ข้อคิดดีๆ",
  },
  quran: {
    system: `คุณคือผู้เชี่ยวชาญด้านอัลกุรอาน
คุณต้องสุ่มอายะฮ์จากอัลกุรอาน 1 อายะฮ์ ที่แตกต่างกันทุกครั้ง
ให้ข้อความอาหรับต้นฉบับ คำแปลภาษาไทยที่ถูกต้อง และแหล่งอ้างอิง (ชื่อซูเราะฮ์ : หมายเลขอายะฮ์)

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{"arabicText": "...", "translationText": "...", "sourceReference": "..."}
ห้ามตอบนอกรูปแบบนี้ ห้ามมี markdown ห้ามมีคำอธิบายเพิ่มเติม`,
    user: "สุ่มอายะฮ์อัลกุรอาน 1 อายะฮ์ ที่ให้ข้อคิดดีๆ",
  },
  dua: {
    system: `คุณคือผู้เชี่ยวชาญด้านดุอาอ์ (การวิงวอนในอิสลาม)
คุณต้องสุ่มดุอาอ์ 1 บท ที่มีชื่อเสียงหรือมาจากอัลกุรอานหรือซุนนะฮ์ ที่แตกต่างกันทุกครั้ง
ให้ข้อความอาหรับต้นฉบับ คำแปลภาษาไทยที่ถูกต้อง และแหล่งอ้างอิง

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{"arabicText": "...", "translationText": "...", "sourceReference": "..."}
ห้ามตอบนอกรูปแบบนี้ ห้ามมี markdown ห้ามมีคำอธิบายเพิ่มเติม`,
    user: "สุ่มดุอาอ์ 1 บท ที่ใช้ในชีวิตประจำวัน",
  },
  "islamic-reminder": {
    system: `คุณคือผู้เชี่ยวชาญด้านอิสลามศึกษา
คุณต้องสุ่มข้อคิดเตือนสติอิสลาม 1 ข้อ พร้อมหลักฐานจากหะดีษหรืออัลกุรอาน ที่แตกต่างกันทุกครั้ง
ให้ข้อความอาหรับ (หะดีษหรืออายะฮ์ที่เกี่ยวข้อง) คำแปลภาษาไทย และแหล่งอ้างอิง

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{"arabicText": "...", "translationText": "...", "sourceReference": "..."}
ห้ามตอบนอกรูปแบบนี้ ห้ามมี markdown ห้ามมีคำอธิบายเพิ่มเติม`,
    user: "สุ่มข้อคิดเตือนสติอิสลาม 1 ข้อ ที่ให้กำลังใจ",
  },
  "general-inspirational": {
    system: `คุณคือผู้เชี่ยวชาญด้านคำคมสร้างแรงบันดาลใจ
คุณต้องสุ่มคำคมที่มีชื่อเสียงระดับโลก 1 ข้อ ที่แตกต่างกันทุกครั้ง
ให้ข้อความภาษาอังกฤษต้นฉบับ คำแปลภาษาไทย และแหล่งอ้างอิง (ชื่อบุคคลผู้กล่าว)

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{"arabicText": "...", "translationText": "...", "sourceReference": "..."}
หมายเหตุ: สำหรับ arabicText ให้ใส่ข้อความต้นฉบับภาษาอังกฤษแทน
ห้ามตอบนอกรูปแบบนี้ ห้ามมี markdown ห้ามมีคำอธิบายเพิ่มเติม`,
    user: "สุ่มคำคมสร้างแรงบันดาลใจ 1 ข้อ จากบุคคลที่มีชื่อเสียง",
  },
};

// ─── Provider-specific LLM call helpers ──────────────────────

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const response = await fetch(
    `${baseUrl}/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedPrompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 500 },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.0,
        max_tokens: 500,
      }),
    },
  );

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenRouter(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": appUrl,
        "X-Title": "AI Content Creator",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.0,
        max_tokens: 500,
      }),
    },
  );

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callWavespeed(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model =
    process.env.WAVESPEED_CONTENT_MODEL || "deepseek-ai/DeepSeek-V3";
  const response = await fetch("https://llm.wavespeed.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 10000,
    }),
  });

  if (!response.ok)
    throw new Error(`Wavespeed LLM API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── Resolve provider + key ──────────────────────────────────

function resolveProvider(): { provider: AIProvider; apiKey: string } {
  const provider = (process.env.AI_PROVIDER as AIProvider) || "gemini";
  let apiKey = "";
  switch (provider) {
    case "gemini":
      apiKey = process.env.GEMINI_API_KEY || "";
      break;
    case "groq":
      apiKey = process.env.GROQ_API_KEY || "";
      break;
    case "openrouter":
      apiKey = process.env.OPENROUTER_API_KEY || "";
      break;
    case "wavespeed":
      apiKey = process.env.WAVESPEED_API_KEY || "";
      break;
    default:
      break;
  }
  return { provider, apiKey };
}

async function callLLM(
  provider: AIProvider,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  switch (provider) {
    case "gemini":
      return callGemini(apiKey, systemPrompt, userPrompt);
    case "groq":
      return callGroq(apiKey, systemPrompt, userPrompt);
    case "openrouter":
      return callOpenRouter(apiKey, systemPrompt, userPrompt);
    case "wavespeed":
      return callWavespeed(apiKey, systemPrompt, userPrompt);
    case "mock":
      return JSON.stringify({
        arabicText: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ",
        translationText: "ผู้ใดไม่เมตตา เขาก็จะไม่ได้รับความเมตตา",
        sourceReference: "متفق عليه",
      });
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// ─── Route Handler ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const theme = request.nextUrl.searchParams.get("theme");

    if (!theme || !THEME_PROMPTS[theme]) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid theme. Available: ${Object.keys(THEME_PROMPTS).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const { provider, apiKey } = resolveProvider();

    if (provider !== "mock" && !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: `No API key configured for provider: ${provider}`,
        },
        { status: 500 },
      );
    }

    const { system, user } = THEME_PROMPTS[theme];
    const rawResponse = await callLLM(provider, apiKey, system, user);

    // Parse JSON from LLM response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "[API photo-content] Failed to parse LLM response:",
        rawResponse,
      );
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response as JSON" },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.arabicText || !parsed.translationText) {
      return NextResponse.json(
        { success: false, error: "Incomplete AI response" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      arabicText: parsed.arabicText,
      translationText: parsed.translationText,
      sourceReference: parsed.sourceReference || "",
    });
  } catch (error) {
    console.error("[API photo-content] ❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
