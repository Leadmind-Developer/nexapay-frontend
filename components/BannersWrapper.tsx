"use client";

import React, { ReactNode } from "react";
import { Banner } from "./Banner";
import { PromoPage } from "@/lib/promo.config";

interface Props {
  children: ReactNode;
  page: PromoPage;
}

/**
 * Page banner layout (top banners only)
 */
export default function BannersWrapper({ children, page }: Props) {
  return (
    <div className="flex flex-col">
      {/* Push content down from header */}
      <Banner spacer spaceY={12} />

      {/* Top promos */}
      <div className="space-y-6 mb-6">
        {/* Ad 1 */}
        <Banner page={page} />

        {/* Extra space between header and Ad 2 */}
        <Banner spacer spaceY={6} />

        {/* Ad 2 */}
        <Banner page={page} />
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
