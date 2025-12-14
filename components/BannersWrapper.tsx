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

      {/* Top promo (Ad 2 only) */}
      <div className="mb-6">
        {/* Extra breathing space */}
        <Banner spacer spaceY={6} />

        {/* Active promo */}
        <Banner page={page} />
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
