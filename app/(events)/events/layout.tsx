// app/(events)/events/layout.tsx
import { ReactNode } from "react";
import "../../globals.css";

export const metadata = {
  title: "Nexa Events - Explore & Attend Events",
  description:
    "Discover and attend amazing events with Nexa. Fast, secure, and all-in-one platform for event discovery and ticketing.",
  keywords: "Nexa, events, tickets, discover events, attend events, Nigerian events",
  alternates: {
    canonical: "https://nexa.com.ng/events",
  },
  openGraph: {
    title: "Nexa Events - Explore & Attend Events",
    description:
      "Find events you love, get tickets instantly, and join the experience with Nexa.",
    url: "https://nexa.com.ng/events",
    images: [
      {
        url: "https://nexa.com.ng/og-events.png",
        width: 1200,
        height: 630,
        alt: "Nexa Events - Explore & Attend",
      },
    ],
    type: "website",
    siteName: "Nexa Events",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa Events - Explore & Attend Events",
    description:
      "Instantly discover events and get tickets with Nexa. Safe, fast, and hassle-free.",
    images: ["https://nexa.com.ng/twitter-events.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
          {/* Main content */}
          <main className="flex-1 w-full">{children}</main>

          {/* Footer */}
          <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-700">
            © {new Date().getFullYear()} Nexa Events
          </footer>
        </div>
      </body>
    </html>
  );
}
