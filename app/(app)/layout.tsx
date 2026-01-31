// app/(app)/layout.tsx
import "../globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Nexa - Payments, Utilities & Event Management",
  description:
    "Simplify payments, manage events, pay bills, buy airtime, track expenses and more with Nexa. Fast, secure, and all-in-one platform.",
  keywords:
    "Nexa, payments, bills, airtime, events, utilities, expense tracking, finance, dashboard, Nigerian fintech",
  alternates: {
    canonical: "https://nexa.com.ng",
  },
  openGraph: {
    title: "Nexa - All-in-One Payments & Event Platform",
    description:
      "Instantly pay bills, manage events, buy airtime, track expenses, and more. Fast, secure, and user-friendly.",
    url: "https://nexa.com.ng",
    images: [
      {
        url: "https://nexa.com.ng/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexa App - Payments & Events",
      },
    ],
    type: "website",
    siteName: "Nexa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa - Payments, Utilities & Event Platform",
    description:
      "All-in-one platform to pay bills, manage events, buy airtime, and track finances. Fast, secure, no signup required.",
    images: ["https://nexa.com.ng/twitter-image.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col md:flex-row">
          {/* Global navigation */}
          <NavBar />

          {/* Main content */}
          <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
            <main className="flex-1 overflow-auto">{children}</main>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-gray-500">
              © {new Date().getFullYear()} Nexa
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
