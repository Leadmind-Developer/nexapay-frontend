// app/(events)/events/layout.tsx
import { ReactNode } from "react";
import "../../globals.css";

export const metadata = {
  title: "Discover Events in Nigeria | Nexa Events",
  description:
    "Find concerts, workshops, conferences, and more. Attend events or start your own with Nexa Events, the all-in-one event platform in Nigeria.",
  keywords: "Nexa, events, Nigeria, concerts, workshops, conferences, parties, ticketing",
  alternates: {
    canonical: "https://nexa.com.ng/events",
  },
  openGraph: {
    title: "Discover Events in Nigeria | Nexa Events",
    description:
      "Attend amazing events or start your own. Nexa Events makes it easy for organizers to create and sell tickets online.",
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
    title: "Discover Events in Nigeria | Nexa Events",
    description:
      "Attend amazing events or start your own with Nexa Events.",
    images: ["https://nexa.com.ng/og-events.png"],
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
