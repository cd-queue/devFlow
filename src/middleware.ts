import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * -------------------------------------------------------------
 * Next.js Edge Middleware for Neon Auth & Session Management
 * -------------------------------------------------------------
 * 1. Handles OAuth callback session token exchange.
 * 2. Allows guest visitors to view the dashboard at "/" without
 *    being forced to sign in.
 * 3. Enforces protected routes if unauthenticated.
 */
const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(request: NextRequest) {
  const response = await authMiddleware(request);

  // If a guest visitor is on the home page ("/"), allow them to
  // view the board instead of redirecting them to the login page.
  if (
    request.nextUrl.pathname === "/" &&
    response.headers.get("location")?.includes("/auth/sign-in")
  ) {
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    // Runs on all routes except static assets, favicon, and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
