"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import NewUpdate from "@/components/mobile/NewUpdate";
import TopNavBar from "@/components/mobile/TopNavBar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [newUpdateHeight, setNewUpdateHeight] = useState(0);

  // Measure NewUpdate height dynamically
  useEffect(() => {
    const newUpdateRef = document.querySelector("#newUpdate") as HTMLElement | null;
    if (!newUpdateRef) return;

    const updateHeight = () => setNewUpdateHeight(newUpdateRef.offsetHeight || 0);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(newUpdateRef);
    return () => observer.disconnect();
  }, []);

  // Set CSS variable for header offset
  useEffect(() => {
    const totalHeight = newUpdateHeight + 120; // NewUpdate + top bar
    document.documentElement.style.setProperty("--header-height", `${totalHeight}px`);
  }, [newUpdateHeight]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* 🔔 New Update Bar */}
      <div id="newUpdate">
        <NewUpdate />
      </div>

      {/* 🧭 Main Header */}
      <div className="backdrop-blur-md bg-indigo-900/95 dark:bg-indigo-950/90 shadow-md transition-all duration-300 border-b border-indigo-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* 🔹 Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:text-indigo-200 transition-colors"
          >
            NexaPay
          </Link>

          {/* 📱 Mobile Menu Toggle */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-2 md:hidden active:scale-90 transition-transform duration-150"
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
              transition={{ duration: 0.25 }}
              className="bg-indigo-900/95 dark:bg-indigo-950/90 border-t border-indigo-800 shadow-lg backdrop-blur-md md:hidden"
            >
              <nav className="flex flex-col items-center gap-4 py-5">
                {["Services", "Agents", "Developer API"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 rounded-full border border-indigo-600/40 text-indigo-100 font-medium bg-indigo-800/40 hover:bg-indigo-700/60 hover:border-indigo-500/70 hover:text-white shadow-sm hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
                  >
                    {item}
                  </Link>
                ))}

                {/* 🔘 Auth Buttons */}
                <div className="flex gap-3 mt-4">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="px-5 py-2 rounded-full border border-indigo-500/70 text-indigo-200 hover:bg-indigo-600 hover:text-white font-medium shadow-sm hover:shadow-indigo-500/20 transition-all duration-200 active:scale-95"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:from-indigo-500 hover:to-indigo-400 shadow-md hover:shadow-indigo-400/30 transition-all duration-200 active:scale-95"
                  >
                    Register
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🧭 Top Navigation below Header */}
      <div className="border-t border-indigo-800/70 bg-indigo-950 dark:bg-indigo-950">
        <TopNavBar />
      </div>
    </header>
  );
}
