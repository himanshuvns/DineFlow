import { NextRequest, NextResponse } from "next/server";
import { enrichRawExtractedItems, parseMenuOcrText, ParsedMenuItem } from "@/lib/utils/menu-nlp-engine";
import type { MenuItem } from "@/lib/stores/tenant-data-store";

export const maxDuration = 60; // Allow up to 60s for multimodal vision OCR

interface ScanMenuRequestBody {
  imageBase64?: string;
  imagesBase64?: string[];
  rawText?: string;
  existingItems?: MenuItem[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanMenuRequestBody;
    const { imageBase64, imagesBase64, rawText, existingItems = [] } = body;

    const geminiKey = process.env.GEMINI_API_KEY;

    // Collect images to process
    const imagesToProcess: string[] = [];
    if (imageBase64) imagesToProcess.push(imageBase64);
    if (imagesBase64 && Array.isArray(imagesBase64)) {
      imagesToProcess.push(...imagesBase64.filter(Boolean));
    }

    // If Gemini key is available and images are provided, perform real Multimodal Vision OCR
    if (geminiKey && imagesToProcess.length > 0) {
      try {
        const extractedAll: Array<{
          name: string;
          hindiName?: string;
          category?: string;
          price?: number;
          isVeg?: boolean;
          description?: string;
          spicyLevel?: number;
        }> = [];

        // Prompt tailored for Indian restaurant multi-column menus
        const prompt = `You are an expert Indian restaurant menu digitizer.
Analyze this restaurant menu image and extract EVERY single food item across all columns and sections.
Return ONLY a valid JSON array of objects with this schema:
[
  {
    "name": "Dish Name in English",
    "hindiName": "Dish Name in Hindi Devanagari script",
    "category": "Category name from menu (e.g. Breakfast, South Indian, Street Food, North Indian, Biryani, Indian Chinese, Snacks, Pizza, Burgers, Beverages, Desserts)",
    "price": 280,
    "isVeg": true,
    "description": "Short appetizing description",
    "spicyLevel": 1
  }
]
Critical Instructions:
1. Scan all columns thoroughly from top to bottom, left to right.
2. Do not stop early or truncate the list. Extract EVERY single item listed on the menu.
3. If an item has no printed price (such as unpriced burgers or ice cream), set "price": 0 so the owner can enter it manually.
4. Green dot/box indicates vegetarian (isVeg: true). Red/brown dot/box indicates non-vegetarian (isVeg: false).
5. Output ONLY the raw JSON array. Do not include markdown code fences or conversational text.`;

        for (const rawImg of imagesToProcess) {
          // Clean base64 string
          let mimeType = "image/jpeg";
          let cleanB64 = rawImg;

          if (rawImg.startsWith("data:")) {
            const match = rawImg.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              cleanB64 = match[2];
            }
          }

          const payload = {
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanB64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
            },
          };

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`;
          const gemResp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!gemResp.ok) {
            const errText = await gemResp.text();
            console.error("Gemini Vision API error:", gemResp.status, errText);
            continue;
          }

          const data = await gemResp.json();
          let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

          if (text.startsWith("```json")) text = text.slice(7);
          if (text.startsWith("```")) text = text.slice(3);
          if (text.endsWith("```")) text = text.slice(0, -3);

          try {
            const parsedArray = JSON.parse(text.trim());
            if (Array.isArray(parsedArray)) {
              extractedAll.push(...parsedArray);
            }
          } catch (jsonErr) {
            console.error("Failed to parse Gemini output JSON:", jsonErr, text);
          }
        }

        if (extractedAll.length > 0) {
          const enriched = enrichRawExtractedItems(extractedAll, existingItems);
          return NextResponse.json({
            success: true,
            source: "gemini_vision",
            count: enriched.length,
            items: enriched,
          });
        }
      } catch (visionErr) {
        console.error("Vision processing error, falling back to NLP regex parser:", visionErr);
      }
    }

    // Fallback: If raw text provided or no vision output, run NLP regex extractor
    const textToParse = rawText || "";
    const parsed = parseMenuOcrText(textToParse, existingItems);

    return NextResponse.json({
      success: true,
      source: "nlp_engine",
      count: parsed.length,
      items: parsed,
    });
  } catch (err: unknown) {
    console.error("Scan menu API error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
