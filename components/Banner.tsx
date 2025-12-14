"use client";

import React, { ReactNode } from "react";
import { PROMO_RULES, PromoPage } from "@/lib/promo.config";

interface BannerProps {
  page?: PromoPage;
  children?: ReactNode;
  className?: string;
  spacer?: boolean;
  spaceY?: 4 | 6 | 8 | 10 | 12 | 16;
}

export function Banner({
  page,
  children,
  className = "",
  spacer = false,
  spaceY = 8,
}: BannerProps) {
  const spacingMap: Record<number, string> = {
    4: "h-4 mb-4",
    6: "h-6 mb-6",
    8: "h-8 mb-8",
    10: "h-10 mb-10",
    12: "h-12 mb-12",
    16: "h-16 mb-16",
  };

  if (spacer) {
    return <div className={spacingMap[spaceY].split(" ")[0]} />;
  }

  const promo = page ? PROMO_RULES[page] : null;

  return (
    <div
      className={`
        bg-yellow-100 dark:bg-yellow-900
        border-l-4 border-yellow-500 dark:border-yellow-400
        p-4 rounded-xl shadow-sm
        ${spacingMap[spaceY].split(" ")[1]}
        ${className}
      `}
    >
      {children ?? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              {promo?.title ?? "🚀 Nexa Promo"}
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              {promo?.message ??
                "Enjoy fast payments, seamless withdrawals & exclusive rewards."}
            </p>
          </div>

          {promo?.badge && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
              {promo.badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
