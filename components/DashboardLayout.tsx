"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface StoredUser {
  name?: string;
  email?: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  // ✅ Safe JSON parse helper
  const safeParse = (value: string | null): any => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn("Invalid JSON in localStorage:", err);
      return null;
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token) {
        router.replace("/login");
        return;
      }

      const parsed = safeParse(userData);

      if (
        parsed &&
        typeof parsed === "object" &&
        ("name" in parsed || "email" in parsed)
      ) {
        setUser(parsed);
      } else {
        if (userData) {
          console.warn("User data has invalid structure. Clearing.");
          localStorage.removeItem("user");
        }
        setUser(null);
      }
    } catch (err) {
      console.error("Unexpected localStorage error:", err);
      setUser(null);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            NexaApp Dashboard
          </h1>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <User size={16} />
                <span>{user.name || "User"}</span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
