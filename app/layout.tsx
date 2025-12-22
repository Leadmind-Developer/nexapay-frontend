import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar"; // new sidebar component

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
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            {/* Main content scrollable */}
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
          <footer className="text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} NexaApp
          </footer>
        </div>
      </body>
    </html>
  );
}
