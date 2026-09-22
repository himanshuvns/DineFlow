import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const table = searchParams.get("table");

  if (!slug || !table) {
    return NextResponse.json(
      { success: false, error: "Slug and table parameters are required" },
      { status: 400 }
    );
  }

  // Alias demo slugs so public customer tables always load seamlessly
  const resolvedSlug =
    slug.toLowerCase() === "dineflow" || slug.toLowerCase() === "restaurant" || slug.toLowerCase() === "demo"
      ? "the-grand-bistro"
      : slug;

  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api-production-f170.up.railway.app/api/v1"
      : "http://localhost:8080/api/v1");

  try {
    const res = await fetch(
      `${apiBase}/public/tables/${encodeURIComponent(resolvedSlug)}/${encodeURIComponent(table)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, error: "Failed to fetch table details" },
        {
          status: res.status,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error(`[public-table-api] Failed to fetch table for ${slug}/${table}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error contacting restaurant dining engine",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}
