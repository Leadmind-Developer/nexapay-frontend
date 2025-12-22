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
          {/* Sidebar */}
          <NavBar className="fixed top-0 left-0 h-full w-64" />

          {/* Main content */}
          <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
            {/* Optional: header */}
            <header className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-800 shadow">
              <h1 className="font-bold text-lg">Dashboard</h1>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-auto p-6">{children}</main>

            <footer className="text-center py-4 text-sm text-gray-500">
              © {new Date().getFullYear()} NexaApp
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
