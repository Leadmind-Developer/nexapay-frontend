"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MoreVertical, Car, Mail, School, Smartphone, Star, Ticket, Tv, Users, Wifi, Zap } from "lucide-react";
import NewUpdate from "@/components/mobile/NewUpdate"; // Correct import for mobile
import TopNavBar from "@/components/mobile/TopNavBar"; // Correct import for mobile
import { usePathname } from "next/navigation";

const mainItems = [
  { title: "Airtime", href: "/buy-airtime", icon: Smartphone },
  { title: "Data", href: "/buy-data", icon: Wifi },
  { title: "TV", href: "/pay-tv", icon: Tv },
  { title: "Electricity", href: "/pay-electricity", icon: Zap },
];

const moreItems = [
  { title: "Education", href: "/education", icon: School },
  { title: "Event Ticket", href: "/event-ticket", icon: Ticket },
  { title: "Insurance", href: "/insurance", icon: Car },
  { title: "Partner", href: "/partner", icon: Users },
  { title: "Contact", href: "/contact", icon: Mail },
  { title: "What's New", href: "/whats-new", icon: Star },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [flyoutTop, setFlyoutTop] = useState<number>(0);
  const pathname = usePathname();
  const [newUpdateHeight, setNewUpdateHeight] = useState(0);

  // Dynamically measure NewUpdate height
  useEffect(() => {
    const newUpdateRef = document.querySelector("#newUpdate") as HTMLElement | null; // Type assertion
    if (!newUpdateRef) return;

    const updateHeight = () => {
      setNewUpdateHeight(newUpdateRef.offsetHeight || 0);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(newUpdateRef);

    return () => observer.disconnect();
  }, []);

  // 🧭 Set CSS variable for Sidebar alignment
  useEffect(() => {
    const totalHeight = newUpdateHeight + 120; // Rough total header height: new update bar + nav area + top navbar
    document.documentElement.style.setProperty(
      "--header-height",
      `${totalHeight}px`
    );
  }, [newUpdateHeight]);

  const linkClasses = (href: string) =>
    `flex flex-col items-center gap-1 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
      pathname === href
        ? "bg-indigo-700 text-white"
        : "text-gray-300 hover:bg-indigo-800"
    }`;

  // Dynamically calculate flyout position so it stays above ellipsis if near bottom
  useEffect(() => {
    if (showMore && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flyoutHeight = moreItems.length * 40 + 16; // estimated height + padding

      if (spaceBelow < flyoutHeight) {
        // not enough space below → position above
        setFlyoutTop(rect.top - flyoutHeight + window.scrollY);
      } else {
        // enough space below → align top with button
        setFlyoutTop(rect.top + window.scrollY);
      }
    }
  }, [showMore]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* 🔔 New Update Bar */}
      <div id="newUpdate">
        <NewUpdate />
      </div>

      {/* 🧭 Main Header */}
      <div className="backdrop-blur-md bg-indigo-900/95 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* 🔹 Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:text-indigo-200 transition-colors"
          >
            NexaPay
          </Link>

          {/* 🌐 Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main Navigation"
          >
            <Link href="#services" className="text-gray-200 hover:text-white transition">
              Services
            </Link>
            <Link href="#agents" className="text-gray-200 hover:text-white transition">
              Agents
            </Link>
            <Link href="#api" className="text-gray-200 hover:text-white transition">
              Developer API
            </Link>
          </nav>

          {/* 👥 Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-200 hover:text-white font-medium transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </div>

          {/* 📱 Mobile Menu Toggle */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-1"
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 📱 Mobile Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-indigo-900/95 border-t border-indigo-800 shadow-sm backdrop-blur-md"
            >
              <nav
                className="flex flex-col items-center gap-4 py-5"
                aria-label="Mobile Navigation"
              >
                {["Services", "Agents", "Developer API"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    onClick={() => setOpen(false)}
                    className="text-gray-200 hover:text-white transition"
                  >
                    {item}
                  </Link>
                ))}

                <div className="flex gap-4 mt-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-gray-200 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition"
                  >
                    Register
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🧭 Sidebar with More Items Dropdown */}
      <aside
        className="w-32 min-h-screen bg-indigo-900 border-r border-indigo-800 flex flex-col justify-start py-6 fixed left-0 z-50"
        style={{ top: "var(--header-height)" }}
      >
        <div className="flex flex-col items-center space-y-4 relative">
          {/* Main Items */}
          {mainItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-800/60 group-hover:bg-indigo-700 transition-colors duration-300">
                  <Icon size={20} className="text-indigo-100" />
                </div>
                <span className="text-[11px]">{item.title}</span>
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative mt-2">
            <button
              ref={buttonRef}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-800/60 hover:bg-indigo-700 text-gray-200 transition-colors"
              onClick={() => setShowMore((prev) => !prev)}
            >
              <MoreVertical size={18} />
            </button>

            {/* Flyout menu - appears to the right but adjusts vertically */}
            {showMore && (
              <div
                className="fixed z-[9999] bg-indigo-900 border border-indigo-800 rounded-lg shadow-2xl flex flex-col divide-y divide-indigo-800 backdrop-blur-md w-48"
                style={{
                  top: `${flyoutTop}px`,
                  left: "8rem", // positioned to the right of sidebar
                }}
                onMouseLeave={() => setShowMore(false)}
              >
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-indigo-800 text-white font-semibold"
                          : "text-gray-200 hover:bg-indigo-800"
                      }`}
                      onClick={() => setShowMore(false)}
                    >
                      <Icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 🧭 TopNavBar (aligned with sidebar) */}
      <div className="border-t border-indigo-800">
        <div className="ml-32"> {/* 👈 Match sidebar width */}
          <TopNavBar />
        </div>
      </div>
    </header>
  );
}
