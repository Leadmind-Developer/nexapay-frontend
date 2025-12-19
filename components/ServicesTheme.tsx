// components/ServicesTheme.tsx
"use client";

import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow ${className}`}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, disabled, className = "" }: ButtonProps) {
  const baseStyle =
    "w-full py-3 rounded font-semibold text-white disabled:opacity-60";
  const defaultClass = "bg-yellow-500 hover:bg-yellow-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${defaultClass} ${className}`}
    >
      {children}
    </button>
  );
}
