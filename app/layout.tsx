"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoWalletOutline,
  IoCashOutline,
  IoBriefcaseOutline,
  IoGridOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoMenuOutline,
  IoCloseOutline
} from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";
import api from "@/lib/api";

interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavLink[];
}

export default function NavBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.data?.success) {
          setIsLoggedIn(true);
          setUserName(res.data.user.firstName || "User");
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) return null;

  const dashboardLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: <IoHomeOutline /> },
    { name: "Wallet", href: "/dashboard/addmoney", icon: <IoWalletOutline /> },
    { name: "Savings", href: "/dashboard/savings", icon: <IoCashOutline /> },
    { name: "Loans", href: "/dashboard/loans", icon: <IoBriefcaseOutline /> },
    { name: "Funds", href: "/dashboard/funds", icon: <IoCashOutline /> },
    { name: "Internal Transfer", href: "/dashboard/internaltransfer", icon: <IoCashOutline /> },
    {
      name: "More",
      href: "#",
      icon: <IoGridOutline />,
      children: [
        { name: "Profile", href: "/dashboard/profile", icon: <IoPersonOutline /> },
        { name: "Settings", href: "/dashboard/settings", icon: <IoSettingsOutline /> },
        { name: "Reward", href: "/dashboard/reward" },
        { name: "Saved Beneficiaries", href: "/dashboard/savedbeneficiaries" },
        { name: "FAQ", href: "/dashboard/faq" },
        { name: "Setup Naira Account", href: "/dashboard/setupnairaaccount" },
        { name: "Set Username", href: "/dashboard/setusername" },
        { name: "Virtual Account", href: "/dashboard/va" },
        { name: "Wallet History", href: "/dashboard/wallethistory" },
        { name: "Withdraw", href: "/dashboard/withdraw" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexaApp" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">NexaApp</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 dark:text-gray-200">
            <IoMenuOutline size={26} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="NexaApp" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">NexaApp</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600 dark:text-gray-300">
            <IoCloseOutline size={26} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4">
          {dashboardLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href !== "#" ? link.href : ""}
                className={`flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${pathname === link.href ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""}`}
                onClick={() => link.children && setMoreOpen(!moreOpen)}
              >
                {link.icon}
                <span className="flex-1">{link.name}</span>
                {link.children && (
                  moreOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />
                )}
              </Link>
              {link.children && moreOpen && (
                <div className="ml-6 flex flex-col">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 ${pathname === child.href ? "font-medium text-blue-500" : ""}`}
                    >
                      {child.icon && child.icon}
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {isLoggedIn && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <span className="block text-sm mb-2">Hi, {userName}</span>
            <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm">
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </>
  );
}
