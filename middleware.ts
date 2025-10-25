// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// List of routes that require authentication
const protectedRoutes = ["/transactions", "/dashboard", "/webhooks"];

// Pages that should be redirected to the mobile version if the user is on a mobile device
const LANDING_PAGES = ["/", "/landing"];  // Ensure /landing is included if it's used for mobile

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // Check if the route is protected and requires authentication
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Read the HttpOnly server-side cookie for the token
    const token = req.cookies.get("nexa_token")?.value;

    // Redirect to /login if the token is missing
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Device detection for landing pages (for mobile redirection)
  const ua = req.headers.get("user-agent") || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // Only redirect on landing pages for mobile users
  if (LANDING_PAGES.includes(pathname) && isMobile) {
    // Redirect to /landing (mobile version)
    url.pathname = "/landing"; // Ensure the path corresponds to your mobile landing page
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Define which routes the middleware should run on
export const config = {
  matcher: ["/", "/landing", "/transactions/:path*", "/dashboard/:path*", "/webhooks/:path*"],
};
