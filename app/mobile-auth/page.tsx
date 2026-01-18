// app/mobile-auth/page.tsx
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Mobile → Web auth bridge
 *
 * Flow:
 * RN WebView
 *  → https://nexa.com.ng/mobile-auth
 *    (Authorization: Bearer <mobile_jwt>)
 *  → backend verifies token
 *  → returns web session token
 *  → cookie set on nexa.com.ng
 *  → redirect to dashboard
 */
export default async function MobileAuthPage() {
  const headerList = headers();
  const authHeader = headerList.get("authorization");

  if (!authHeader) {
    // No token → fallback to normal login
    redirect("/login");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/mobile/mobile-auth`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "x-platform": "mobile",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      redirect("/login");
    }

    const data = await res.json();

    /**
     * Expected backend response:
     * {
     *   accessToken: string;
     * }
     */
    const token = data?.accessToken;

    if (!token) {
      redirect("/login");
    }

    // Set HttpOnly cookie (EDGE SAFE)
    const cookie = [
      `nexa_token=${token}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=None",
    ].join("; ");

    // Set cookie via response headers
    const cookieStore = await cookies();

    cookieStore.set({
      name: "nexa_token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Success → go to dashboard
    redirect("/dashboard");
  } catch (err) {
    console.error("Mobile auth bridge error:", err);
    redirect("/login");
  }
}
