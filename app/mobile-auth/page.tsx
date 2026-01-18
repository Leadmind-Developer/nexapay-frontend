import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = "https://api.nexa.com.ng/api/auth/mobile/mobile-auth";

export default async function MobileAuthPage() {
  const headerStore = headers();
  const cookieStore = cookies();

  const authHeader = headerStore.get("authorization");

  if (!authHeader) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Authentication failed</h2>
        <p>Missing authorization header.</p>
      </div>
    );
  }

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "x-platform": "mobile",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Mobile auth bridge failed");
    }

    const data = await res.json();
    const { accessToken } = data;

    if (!accessToken) {
      throw new Error("Missing access token from API");
    }

    // ✅ Set cookie on nexa.com.ng (web domain)
    cookieStore.set("nexa_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // 🚀 Logged in → go to dashboard
    redirect("/dashboard");
  } catch (err) {
    console.error("Mobile web auth error:", err);

    return (
      <div style={{ padding: 24 }}>
        <h2>Authentication error</h2>
        <p>Please return to the app and try again.</p>
      </div>
    );
  }
}
