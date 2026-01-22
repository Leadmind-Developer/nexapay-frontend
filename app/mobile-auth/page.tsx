import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MobileAuthPage() {
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (async function () {
                const token = window.__MOBILE_TOKEN__;
                if (!token) {
                  window.location.href = "/login";
                  return;
                }

                try {
                  const res = await fetch(
                    "${process.env.NEXT_PUBLIC_API_BASE}/auth/mobile/mobile-auth",
                    {
                      method: "GET",
                      headers: {
                        Authorization: "Bearer " + token,
                        "x-platform": "mobile",
                      },
                      credentials: "include",
                    }
                  );

                  if (!res.ok) {
                    window.location.href = "/login";
                    return;
                  }

                  const data = await res.json();
                  if (!data?.accessToken) {
                    window.location.href = "/login";
                    return;
                  }

                  document.cookie =
                    "nexa_token=" +
                    data.accessToken +
                    "; Path=/; Domain=.nexa.com.ng; Max-Age=900; Secure; SameSite=None";

                  window.location.href = "/dashboard";
                } catch (e) {
                  window.location.href = "/login";
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
