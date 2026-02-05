"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.data?.success) {
          setIsLoggedIn(true);
          setFirstName(res.data.user.name?.split(" ")[0] || "User");
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
      await api.post("/auth/web/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) return null;

  const dashboardLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: <IoHomeOutline /> },
    { name: "Wallet", href: "/dashboard/wallethistory", icon: <IoWalletOutline /> },
    { name: "Goals", href: "/dashboard/savings", icon: <IoCashOutline /> },
    { name: "Tracker", href: "/expenses", icon: <IoBriefcaseOutline /> },
    { name: "Team Pool", href: "/dashboard/funds", icon: <IoCashOutline /> },
    { name: "Event", href: "/events", icon: <IoCashOutline /> },
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
        { name: "My Naira Account", href: "/dashboard/setupnairaaccount" },
        { name: "Set Username", href: "/dashboard/setusername" },
        { name: "View Account", href: "/dashboard/va" },        
        { name: "My Expenses", href: "/expenses" },
      ],
    },
  ];

  // Toggle children menus for desktop & mobile
  const toggleMore = (name: string) => {
    setMoreOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50">
        <div className="px-6 py-4 flex items-center gap-2">
          <motion.img
            src="/logo.png"
            alt="NexaApp Logo"
            className="h-6 w-auto object-contain flex-shrink-0"
            initial={{ y: -5 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">NexaApp</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          {dashboardLinks.map((link) => (
            <div key={link.name} className="mb-1">
              {!link.children ? (
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    pathname === link.href ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMore(link.name)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.name}
                    </span>
                    {moreOpen[link.name] ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                  </button>
                  {moreOpen[link.name] && (
                    <div className="ml-4 flex flex-col">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            pathname === child.href ? "font-semibold text-blue-500" : ""
                          }`}
                        >
                          {child.icon && child.icon}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        {isLoggedIn && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <span className="block text-sm mb-2 font-medium">Welcome, {firstName}</span>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

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

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NexaApp" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">NexaApp</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-600 dark:text-gray-300">
            <IoCloseOutline size={26} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4 px-2">
          {dashboardLinks.map((link) => (
            <div key={link.name} className="mb-1">
              {!link.children ? (
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    pathname === link.href ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMore(link.name)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.name}
                    </span>
                    {moreOpen[link.name] ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                  </button>
                  {moreOpen[link.name] && (
                    <div className="ml-4 flex flex-col">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            pathname === child.href ? "font-semibold text-blue-500" : ""
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.icon && child.icon}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {isLoggedIn && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <span className="block text-sm mb-2 font-medium">Welcome, {firstName}</span>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
