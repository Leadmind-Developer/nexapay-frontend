import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import LayoutExceptionsWrapper from "@/components/LayoutExceptionsWrapper";
import { cookies } from "next/headers";

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
  const token = cookies().get("token")?.value;

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <LayoutExceptionsWrapper>
          <div className="min-h-screen flex flex-col md:flex-row">
            <NavBar />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
              <main className="flex-1 overflow-auto">{children}</main>
              <footer className="text-center py-4 text-sm text-gray-500">
                © {new Date().getFullYear()} NexaApp
              </footer>
            </div>
          </div>
        </LayoutExceptionsWrapper>
      </body>
    </html>
  );
}
