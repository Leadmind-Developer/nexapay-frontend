// components/ui/button.tsx
"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import cn from "clsx";

/**
 * ButtonProps
 * Extend default button attributes and add optional `variant` and `size`.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Button
 * Reusable button component with Tailwind styling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles: Record<string, string> = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
      outline: "border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-400",
    };

    const sizeStyles: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
