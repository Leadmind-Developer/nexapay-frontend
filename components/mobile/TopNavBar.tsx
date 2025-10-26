"use client";

import React, { useState } from "react";

export default function TopNavBar() {
  const navItems = [
    "Make Payment",
    "Become an Agent",
    "Start Earning",
    "Quick Tools",
    "Loan",
    "Savings",
    "Nexa FundMe",
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
      {/* 🌐 Desktop Navigation */}
      <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4">
        {navItems.map((label) => (
          <button
            key={label}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                       text-gray-700 dark:text-gray-200
                       bg-gray-100/60 dark:bg-gray-800/60
                       hover:bg-indigo-600 hover:text-white hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {label}
          </button>
        ))}
      </div>

      {/* 📱 Mobile Menu Toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="sm:hidden px-4 py-2 rounded-full text-sm font-medium
                   text-gray-700 dark:text-gray-200 bg-gray-100/70 dark:bg-gray-800/70
                   hover:bg-indigo-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {isMenuOpen ? "Close" : "Menu"}
      </button>

      {/* 📱 Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 shadow-lg mt-2 px-4 py-4 backdrop-blur-md z-50">
          <div className="flex flex-col gap-3">
            {navItems.map((label) => (
              <button
                key={label}
                className="w-full text-left px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                           text-gray-700 dark:text-gray-200 bg-gray-100/60 dark:bg-gray-800/60
                           hover:bg-indigo-600 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {label}
              </button>
            ))}
            <button
              className="w-full text-left px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                         text-gray-700 dark:text-gray-200 bg-gray-100/60 dark:bg-gray-800/60
                         hover:bg-indigo-600 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              See What’s New
            </button>
          </div>
        </div>
      )}

      {/* 🆕 Desktop “See What’s New” Button */}
      <button
        className="hidden sm:block px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                   bg-indigo-600 text-white hover:bg-indigo-700 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        See What’s New
      </button>
    </nav>
  );
}
