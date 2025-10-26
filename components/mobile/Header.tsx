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
      <div className="backdrop-blur-md bg-indigo-900/95 shadow-sm transition-all duration-300">
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
            className="text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-1 md:hidden"
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
              className="bg-indigo-900/95 border-t border-indigo-800 shadow-sm backdrop-blur-md md:hidden"
            >
              <nav className="flex flex-col items-center gap-4 py-5">
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

      {/* 🧭 Top Navigation below Header */}
      <div className="border-t border-indigo-800 bg-indigo-950">
        <TopNavBar />
      </div>
    </header>
  );
}
