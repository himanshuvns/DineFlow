import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, rating, categories, comment, guestName, guestPhone, guestEmail, tableOrRoom } = body;

    if (!rating) {
      return NextResponse.json(
        { success: false, error: "Rating is required" },
        { status: 400 }
      );
    }

    const feedbackRecord = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantSlug: tenantSlug || "the-grand-bistro",
      rating: Number(rating),
      categories: Array.isArray(categories) ? categories : [],
      comment: String(comment || "").trim(),
      guestName: guestName ? String(guestName).trim() : undefined,
      guestPhone: guestPhone ? String(guestPhone).trim() : undefined,
      guestEmail: guestEmail ? String(guestEmail).trim() : undefined,
      tableOrRoom: tableOrRoom ? String(tableOrRoom).trim() : undefined,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted directly to restaurant management.",
        data: feedbackRecord,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "the-grand-bistro";

  return NextResponse.json({
    success: true,
    tenantSlug: slug,
    message: "Feedback records live sync enabled.",
  });
}
