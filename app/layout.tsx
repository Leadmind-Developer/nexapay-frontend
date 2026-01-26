"use client";

import "./globals.css";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT render the global NavBar
  const isOrganizer = pathname.startsWith("/organizer");
  const isEvents = pathname.startsWith("/events");
  const isLanding = pathname === "/"; // Landing page

  const skipGlobalLayout = isOrganizer || isLanding || isEvents;

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {skipGlobalLayout ? (
          // ORGANIZER OR LANDING PAGE CONTROL THEIR OWN LAYOUT
          children
        ) : (
          // GLOBAL APP LAYOUT
          <div className="min-h-screen flex flex-col md:flex-row">
            <NavBar />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
              <main className="flex-1 overflow-auto">{children}</main>

              <footer className="text-center py-4 text-sm text-gray-500">
                © {new Date().getFullYear()} NexaApp
              </footer>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
