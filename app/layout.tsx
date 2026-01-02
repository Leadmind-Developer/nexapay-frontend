import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { cookies } from "next/headers";

// Keep metadata
export const metadata = {
  title: "NexaApp",
  description: "NexaApp — payments unified interface",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  /**
   * ----------------------------
   * Server-side detection
   * ----------------------------
   * Cookies are synchronous
   */
  const token = cookies().get("token")?.value;
  const isLoggedIn = Boolean(token);

  // ----------------------------
  // Pathname-based layout exceptions
  // ----------------------------
  // Root layout cannot use `usePathname()` here because it's server component
  // So we wrap in a client component if needed
  const LandingAndOrganizerWrapper = ({ children }: { children: ReactNode }) => {
    "use client";
    import { usePathname } from "next/navigation";
    const pathname = usePathname();
    const isLanding = pathname === "/";
    const isOrganizer = pathname.startsWith("/organizer");
    const skipGlobalLayout = isLanding || isOrganizer;
    return <>{skipGlobalLayout ? children : <>{children}</>}</>;
  };

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <LandingAndOrganizerWrapper>
          {/* Global Layout */}
          <div className="min-h-screen flex flex-col md:flex-row">
            <NavBar />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
              <main className="flex-1 overflow-auto">{children}</main>
              <footer className="text-center py-4 text-sm text-gray-500">
                © {new Date().getFullYear()} NexaApp
              </footer>
            </div>
          </div>
        </LandingAndOrganizerWrapper>
      </body>
    </html>
  );
}
