import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "NexaApp",
  description: "NexaApp — payments unified interface",
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
        <div className="min-h-screen flex">
          {/* Sidebar + Header handled internally */}
          <NavBar />

          {/* Main content area */}
          <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
            {/* Page content scrolls here */}
            <main className="flex-1 overflow-auto">{children}</main>

            <footer className="text-center py-4 text-sm text-gray-500">
              © {new Date().getFullYear()} NexaApp
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
