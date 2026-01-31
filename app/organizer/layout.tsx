// app/organizer/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const metadata = {
  title: "Nexa Events Organizer",
  description:
    "Manage your events with Nexa. Create, track, and optimize your events easily. Perfect for organizers looking to grow their audience and manage ticketing.",
  keywords:
    "Nexa Events, event organizer, ticketing, event management, dashboard, create events, Nigeria, Lagos, Abuja, global world",
  alternates: {
    canonical: "https://nexa.com.ng/organizer/events",
  },
  openGraph: {
    title: "Nexa Events Organizer",
    description:
      "Create and manage events, track attendees, and handle ticketing seamlessly with Nexa Events.",
    url: "https://nexa.com.ng/organizer/events",
    images: [
      {
        url: "https://nexa.com.ng/event-og.png",
        width: 1200,
        height: 630,
        alt: "Nexa Events - Organizer Dashboard",
      },
    ],
    type: "website",
    siteName: "Nexa Events",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa Events Organizer",
    description:
      "Manage your events, track attendees, and create tickets with Nexa Events. Fast, secure, and user-friendly.",
    images: ["https://nexa.com.ng/event-twitter.png"],
  },
};

const navItems = [
  { label: "Dashboard", href: "/organizer/events" },
  { label: "Create Event", href: "/organizer/events/create" },
  { label: "My Tickets", href: "/organizer/events/tickets" },
  { label: "Analytics", href: "/organizer/events/analytics" },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        {/* Branding */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold">Nexa Events</h1>
          <p className="text-sm text-gray-500">Organizer Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-2 text-sm font-medium transition
                  ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-sm text-gray-500">
          © {new Date().getFullYear()} Nexa Events
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-white border-b px-4 py-3">
          <h2 className="font-semibold">Nexa Events Organizer</h2>
        </header>

        {/* Main content */}
        <main className="p-4 md:p-8 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
