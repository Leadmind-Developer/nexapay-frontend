"use client";

import React, { ReactNode } from "react";
import { Banner } from "./Banner";

interface Props {
  children: ReactNode;
}

/**
 * Wraps a page content with top + side banners
 */
export default function BannersWrapper({ children }: Props) {
  return (
    <div className="relative flex flex-col sm:flex-row gap-4">
      {/* Left sidebar banner (desktop only) */}
      <div className="hidden sm:block w-48 flex-shrink-0 sticky top-24">
        <Banner>Side Banner 1</Banner>
      </div>

      {/* Main content + top banners */}
      <div className="flex-1 flex flex-col">
        {/* Top banners */}
        <div className="mb-4 space-y-2">
          <Banner>Announcement / Ad 1</Banner>
          <Banner>Announcement / Ad 2</Banner>
        </div>

        {/* Page content */}
        {children}
      </div>

      {/* Right sidebar banner (desktop only) */}
      <div className="hidden sm:block w-48 flex-shrink-0 sticky top-24">
        <Banner>Side Banner 2</Banner>
      </div>
    </div>
  );
}
