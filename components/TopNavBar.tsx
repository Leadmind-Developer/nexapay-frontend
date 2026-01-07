"use client";

import React from "react";

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

  // Items to hide (still present in the array)
  const hiddenItems = ["Loan", "Savings", "Nexa FundMe"];

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {navItems.map((label) => (
          <button
            key={label}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors ${
              hiddenItems.includes(label) ? "hidden" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button className="text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition-colors">
        See What’s New
      </button>
    </nav>
  );
}
