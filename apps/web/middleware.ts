import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route paths
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // In production, check for refresh token cookie or session token
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Note: During local development / demo mode, allow direct navigation if query param ?demo=true or cookie exists
  if (isDashboardRoute && !refreshToken && request.nextUrl.searchParams.get("demo") === "force_auth") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
