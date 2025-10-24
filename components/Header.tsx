"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import NewUpdate from "@/components/NewUpdate";
import TopNavBar from "@/components/TopNavBar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const newUpdateRef = useRef<HTMLDivElement | null>(null);
  const [newUpdateHeight, setNewUpdateHeight] = useState(0);

  // Dynamically measure NewUpdate height
  useEffect(() => {
    if (!newUpdateRef.current) return;

    const updateHeight = () => {
      setNewUpdateHeight(newUpdateRef.current?.offsetHeight || 0);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(newUpdateRef.current);

    return () => observer.disconnect();
  }, []);

  // 🧭 Set CSS variable for Sidebar alignment
  useEffect(() => {
    // Rough total header height: new update bar + nav area + top navbar
    const totalHeight = newUpdateHeight + 120; // tweak ±10 if needed
    document.documentElement.style.setProperty(
      "--header-height",
      `${totalHeight}px`
    );
  }, [newUpdateHeight]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* 🔔 New Update Bar */}
      <div ref={newUpdateRef}>
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

        {/* 🧭 TopNavBar (aligned with sidebar) */}
        <div className="border-t border-indigo-800">
          <div className="ml-32"> {/* 👈 Match sidebar width */}
            <TopNavBar />
          </div>
        </div>
      </div>
    </header>
  );
}
