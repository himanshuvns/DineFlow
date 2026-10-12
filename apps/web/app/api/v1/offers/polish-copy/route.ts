import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "",
      description = "",
      restaurantName = "The Grand Bistro",
      discountType = "percent",
      discountValue = 20,
      freeItemName = "",
    } = body;

    const discountPhrase =
      discountType === "percent"
        ? `${discountValue}% OFF`
        : discountType === "fixed"
        ? `₹${discountValue} OFF`
        : `Free ${freeItemName || "Special Perk"}`;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    let aiResult: { title: string; description: string; promoCode: string } | null = null;

    if (apiKey) {
      const prompt = `You are an elite hospitality and restaurant marketing copywriter for "${restaurantName}".
The restaurant manager has provided this promotional draft:
- Draft Title / Subject: "${title.trim()}"
- Draft Ad Copy Body: "${description.trim()}"
- Discount Offer: ${discountPhrase}

INSTRUCTIONS:
1. PRESERVE THE MANAGER'S SUBJECT: You must maintain the manager's intended dish, item, or theme (e.g., if they wrote about Biryani, keep Biryani; if Cocktails, keep Cocktails; if Desserts, keep Desserts).
2. ELEVATE THE HEADLINE: Rewrite the title to be irresistible, catchy, and high-converting. Prepend 1 relevant appetizing emoji at the start.
3. ELEVATE THE BODY COPY: Rewrite the ad body into 2 mouth-watering, persuasive sentences that stimulate appetite and create excitement.
4. PROMO CODE: Generate a memorable, clean coupon code in ALL-CAPS (alphanumeric, max 10 chars, e.g. FEAST20, CHEF20) matching their subject.

Return STRICTLY valid JSON with no markdown backticks and no extra commentary:
{
  "title": "string",
  "description": "string",
  "promoCode": "string"
}`;

      const modelsToTry = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];

      for (const model of modelsToTry) {
        try {
          const gemRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.7,
                },
              }),
            }
          );

          if (gemRes.ok) {
            const gemJson = await gemRes.json();
            const rawText = gemJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.title && parsed.description) {
                aiResult = {
                  title: parsed.title,
                  description: parsed.description,
                  promoCode: (parsed.promoCode || "SPECIAL20").toUpperCase().replace(/[^A-Z0-9]/g, ""),
                };
                break;
              }
            }
          }
        } catch (callErr) {
          console.warn(`[AI Polish] Model ${model} failed, trying fallback:`, callErr);
        }
      }
    }

    // Contextual fallback: if Gemini API is unreachable, intelligently polish using the manager's exact words
    if (!aiResult) {
      const userSubject = title.trim() || description.trim() || "Chef's Special";
      const cleanSubject = userSubject.replace(/^[^\w\s]+/g, "").trim();

      // Detect relevant emoji based on the manager's words
      let emoji = "✨";
      const lower = userSubject.toLowerCase();
      if (lower.includes("pizza")) emoji = "🍕";
      else if (lower.includes("burger")) emoji = "🍔";
      else if (lower.includes("biryani") || lower.includes("rice")) emoji = "🍛";
      else if (lower.includes("drink") || lower.includes("cocktail") || lower.includes("beer")) emoji = "🍹";
      else if (lower.includes("sweet") || lower.includes("dessert") || lower.includes("cake")) emoji = "🍰";
      else if (lower.includes("fry") || lower.includes("fries") || lower.includes("snack")) emoji = "🍟";
      else if (lower.includes("coffee") || lower.includes("tea")) emoji = "☕";
      else if (lower.includes("chicken") || lower.includes("meat") || lower.includes("bbq")) emoji = "🍗";
      else if (lower.includes("tiffin") || lower.includes("thali") || lower.includes("curry")) emoji = "🥘";

      // Extract subject keyword for promo code
      const firstWord = cleanSubject.split(/\s+/)[0]?.toUpperCase() || "FEAST";
      const cleanWord = firstWord.replace(/[^A-Z0-9]/g, "").slice(0, 6);
      const valNum = typeof discountValue === "number" ? discountValue : 20;
      const code = `${cleanWord || "DEAL"}${valNum}`;

      aiResult = {
        title: `${emoji} ${cleanSubject}: Enjoy ${discountPhrase} Right Now!`,
        description: description.trim()
          ? `${description.trim()} Crafted fresh to order at ${restaurantName} with ${discountPhrase}. Hot, flavorful, and ready for your table!`
          : `Indulge in freshly prepared ${cleanSubject} at ${restaurantName} with ${discountPhrase}. Prepared hot and fresh for your table or doorstep!`,
        promoCode: code,
      };
    }

    return NextResponse.json({
      success: true,
      data: aiResult,
    });
  } catch (err: any) {
    console.error("Failed to polish copy:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to polish copy with AI" },
      { status: 500 }
    );
  }
}
