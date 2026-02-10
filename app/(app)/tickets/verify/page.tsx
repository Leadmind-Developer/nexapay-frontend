// app/(events)/organizer/layout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../globals.css";

const navItems = [
  { label: "Dashboard", href: "/organizer/events" },
  { label: "Create Event", href: "/organizer/events/create" },
  { label: "Payouts", href: "/organizer/payouts" },
  { label: "Explore Events", href: "/events" },
  { label: "Image Guidelines", href: "/events/image-guidelines" },
  { label: "Verify Ticket", href: "/tickets/verify" },
];

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex">

          {/* SIDEBAR */}
          <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">

            {/* Branding */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold">Nexa Events</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organizer
              </p>
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
                      ${
                        active
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Nexa Events
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div className="flex-1 flex flex-col">

            {/* Mobile Top Bar */}
            <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h2 className="font-semibold">Organizer</h2>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}
