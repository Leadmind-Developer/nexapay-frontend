"use client";

import React, { ReactNode } from "react";
import { Banner } from "./Banner";
import { PromoPage } from "@/lib/promo.config";

interface Props {
  children: ReactNode;
  page: PromoPage;
}

/**
 * Page banner layout (top + side promos)
 * Content comes from Banner via promo rules
 */
export default function BannersWrapper({ children, page }: Props) {
  return (
    <div className="relative flex flex-col sm:flex-row gap-6">
      {/* Left sidebar banner (desktop only) */}
      <div className="hidden sm:block w-48 flex-shrink-0 sticky top-24">
        <Banner page={page} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top banners */}
        <div className="space-y-6 mb-6">
          {/* Spacer / breathing room */}
          <Banner spacer spaceY={12} />

          {/* Primary promo */}
          <Banner page={page} />
        </div>

        {/* Page content */}
        {children}
      </div>

      {/* Right sidebar banner (desktop only) */}
      <div className="hidden sm:block w-48 flex-shrink-0 sticky top-24">
        <Banner page={page} />
      </div>
    </div>
  );
}
