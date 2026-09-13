import { NextRequest, NextResponse } from "next/server";
import { enrichRawExtractedItems, parseMenuOcrText } from "@/lib/utils/menu-nlp-engine";
import type { MenuItem } from "@/lib/stores/tenant-data-store";

export const maxDuration = 60;

interface ScanMenuRequestBody {
  imageBase64?: string;
  imagesBase64?: string[];
  rawText?: string;
  existingItems?: MenuItem[];
}

// Ordered fallback chain — stops at first successful model
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const MENU_PROMPT = `You are an expert restaurant menu digitizer.
Analyze this menu image and extract EVERY single food/drink item across ALL columns and sections.
Return ONLY a valid JSON array — no markdown fences, no extra text:
[
  {
    "name": "Item name in English",
    "hindiName": "optional Hindi name in Devanagari",
    "category": "Exact category heading from menu (Coffee, Tea & More, Cold Drinks, Breakfast, Sandwiches, Salads, Snacks & Bites, Desserts, North Indian, South Indian, Biryani, Beverages, etc.)",
    "price": 140,
    "isVeg": true,
    "description": "Short appetizing description",
    "spicyLevel": 1
  }
]
Rules:
1. Scan ALL columns top-to-bottom, left-to-right. Do NOT miss any section.
2. Extract EVERY item — never truncate.
3. Use the EXACT category name printed in the menu.
4. Set price to 0 if not visible.
5. Output ONLY the raw JSON array, nothing else.`;

type RawMenuItem = {
  name: string;
  hindiName?: string;
  category?: string;
  price?: number;
  isVeg?: boolean;
  description?: string;
  spicyLevel?: number;
};

async function callGeminiVision(
  model: string,
  apiKey: string,
  mimeType: string,
  base64Data: string
): Promise<{ ok: boolean; items: RawMenuItem[]; error?: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: MENU_PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 16384 },
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`[scan] ${model} HTTP ${resp.status}:`, errBody.slice(0, 400));
    return { ok: false, items: [], error: `${model}: HTTP ${resp.status} — ${errBody.slice(0, 200)}` };
  }

  const data = await resp.json();
  let text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason ?? "unknown";
    console.warn(`[scan] ${model} empty response, finishReason: ${reason}`);
    return { ok: false, items: [], error: `${model}: empty response (finishReason=${reason})` };
  }

  // Strip markdown fences
  text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  // Extract array even if surrounded by extra text
  const s = text.indexOf("[");
  const e = text.lastIndexOf("]");
  if (s === -1 || e === -1 || e < s) {
    console.warn(`[scan] ${model} no JSON array found:`, text.slice(0, 200));
    return { ok: false, items: [], error: `${model}: no JSON array in response` };
  }

  try {
    const parsed = JSON.parse(text.slice(s, e + 1)) as RawMenuItem[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`[scan] ${model} ✓ ${parsed.length} items`);
      return { ok: true, items: parsed };
    }
    return { ok: false, items: [], error: `${model}: parsed array empty` };
  } catch (err) {
    console.error(`[scan] ${model} JSON parse error:`, err);
    return { ok: false, items: [], error: `${model}: JSON parse failed` };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanMenuRequestBody;
    const { imageBase64, imagesBase64, rawText, existingItems = [] } = body;

    const geminiKey = process.env.GEMINI_API_KEY;
    console.log("[scan] key present:", !!geminiKey, "len:", geminiKey?.length ?? 0);

    const imagesToProcess: string[] = [];
    if (imageBase64) imagesToProcess.push(imageBase64);
    if (imagesBase64 && Array.isArray(imagesBase64)) imagesToProcess.push(...imagesBase64.filter(Boolean));
    console.log("[scan] images:", imagesToProcess.length);

    if (geminiKey && imagesToProcess.length > 0) {
      const extractedAll: RawMenuItem[] = [];
      const allErrors: string[] = [];

      for (const rawImg of imagesToProcess) {
        let mimeType = "image/jpeg";
        let cleanB64 = rawImg;
        if (rawImg.startsWith("data:")) {
          const m = rawImg.match(/^data:([^;]+);base64,(.+)$/);
          if (m) { mimeType = m[1]; cleanB64 = m[2]; }
        }
        console.log("[scan] img mimeType:", mimeType, "b64len:", cleanB64.length);

        let extracted = false;
        for (const model of GEMINI_MODELS) {
          console.log("[scan] trying:", model);
          const result = await callGeminiVision(model, geminiKey, mimeType, cleanB64);
          if (result.ok) { extractedAll.push(...result.items); extracted = true; break; }
          if (result.error) allErrors.push(result.error);
        }
        if (!extracted) console.warn("[scan] all models failed. errors:", allErrors);
      }

      if (extractedAll.length > 0) {
        const enriched = enrichRawExtractedItems(extractedAll, existingItems);
        return NextResponse.json({ success: true, source: "gemini_vision", count: enriched.length, items: enriched });
      }

      if (allErrors.length > 0) {
        return NextResponse.json(
          { success: false, error: "Gemini Vision failed", details: allErrors[0], allErrors },
          { status: 502 }
        );
      }
    }

    if (rawText) {
      const parsed = parseMenuOcrText(rawText, existingItems);
      return NextResponse.json({ success: true, source: "nlp_engine", count: parsed.length, items: parsed });
    }

    return NextResponse.json({ success: false, error: "No image, text, or GEMINI_API_KEY provided." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[scan] unhandled:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
