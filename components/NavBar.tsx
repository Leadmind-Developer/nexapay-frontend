"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Example: Replace with your auth logic (cookie/localStorage/JWT)
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("userName");
    if (token) {
      setIsLoggedIn(true);
      setUserName(user || "User");
    }
  }, []);

  const publicNav = [
    { name: "Home", href: "/" },
    { name: "Webhooks", href: "/webhooks" },
    { name: "Transactions", href: "/transactions/cashout" },
  ];

  const dashboardNav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Savings", href: "/dashboard/savings" },
    { name: "Loans", href: "/dashboard/loans" },
    { name: "Funds", href: "/dashboard/funds" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  const navItems = isLoggedIn ? dashboardNav : publicNav;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            NexaApp
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  pathname === item.href
                    ? "text-blue-500 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Hi, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500"
            >
              Login
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
