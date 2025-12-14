"use client";

import React, { ReactNode } from "react";

interface BannerProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Simple wrapper for banners
 */
export function Banner({ children, className }: BannerProps) {
  return (
    <div
      className={`bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded mb-4 shadow-sm ${className || ""}`}
    >
      {children}
    </div>
  );
}
