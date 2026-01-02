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

interface RootLayoutProps {
  children: ReactNode;
  params: { [key: string]: string }; // provided by Next.js
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  // Determine current route from params or folder structure
  // Root landing page has empty params
  const isLanding = Object.keys(params).length === 0;

  // Organizer routes are in /organizer folder
  const isOrganizer = "organizer" in params;

  const skipGlobalLayout = isLanding || isOrganizer;

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {skipGlobalLayout ? (
          children
        ) : (
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
