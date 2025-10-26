// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// List of routes that require authentication
const protectedRoutes = ["/transactions", "/dashboard", "/webhooks"];

// Pages for mobile redirection
const LANDING_PAGES = ["/"]; // ✅ Only redirect from root

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // Check if the route is protected and requires authentication
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const token = req.cookies.get("nexa_token")?.value;
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Device detection for landing pages
  const ua = req.headers.get("user-agent") || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // ✅ Redirect only if visiting root `/` on mobile
  if (pathname === "/" && isMobile) {
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Define which routes the middleware should run on
export const config = {
  matcher: ["/", "/landing", "/transactions/:path*", "/dashboard/:path*", "/webhooks/:path*"],
};
