// app/mobile-auth/page.tsx
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Mobile → Web auth bridge
 *
 * RN WebView:
 *   → https://nexa.com.ng/mobile-auth
 *   (Authorization: Bearer <mobile_jwt>)
 */
export default async function MobileAuthPage() {
  // ✅ headers() is async in Next 16
  const headerList = await headers();
  const authHeader = headerList.get("authorization");

  // No mobile token → fallback to web login
  if (!authHeader) {
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
     * Expected response:
     * {
     *   success: true,
     *   accessToken: string
     * }
     */
    const token = data?.accessToken;

    if (!token) {
      redirect("/login");
    }

    // ✅ Correct way to set HttpOnly cookies in App Router
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

    // ✅ Success → authenticated web session
    redirect("/dashboard");
  } catch (err) {
    console.error("Mobile auth bridge error:", err);
    redirect("/login");
  }
}
