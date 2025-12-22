import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "NexaApp",
  description: "NexaApp — payments unified interface",
  icons: {
    icon: "/logo.png",          // default favicon
    shortcut: "/logo.png",      // browser shortcut icon
    apple: "/logo.png",         // Apple touch icon
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} NexaApp
          </footer>
        </div>
      </body>
    </html>
  );
}
