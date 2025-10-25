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
    <nav className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex flex-wrap gap-4 sm:gap-6">
        {navItems.map((label) => (
          <button
            key={label}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="sm:hidden text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors"
      >
        {isMenuOpen ? "Close Menu" : "Menu"}
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 mt-2 px-4 py-2 shadow-lg z-50">
          <div className="flex flex-col gap-4">
            {navItems.map((label) => (
              <button
                key={label}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors"
              >
                {label}
              </button>
            ))}
            <button className="text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors">
              See What’s New
            </button>
          </div>
        </div>
      )}

      {/* "See What’s New" Button - Always Visible */}
      <button className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors">
        See What’s New
      </button>
    </nav>
  );
}
