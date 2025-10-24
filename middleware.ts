// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// List of routes that require authentication
const protectedRoutes = ["/transactions", "/dashboard", "/webhooks"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // Check if current route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    // Read HttpOnly server-side cookie
    const token = req.cookies.get("nexa_token")?.value;

    // Redirect to /login if token is missing
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Define which routes the middleware should run on
export const config = {
  matcher: ["/transactions/:path*", "/dashboard/:path*", "/webhooks/:path*"],
};
