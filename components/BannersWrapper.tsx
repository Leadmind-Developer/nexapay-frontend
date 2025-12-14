"use client";

import React, { ReactNode } from "react";
import { Banner } from "./Banner";
import { PromoPage } from "@/lib/promo.config";

interface Props {
  children: ReactNode;
  page: PromoPage;
}

/**
 * Page banner layout (top banner only)
 */
export default function BannersWrapper({ children, page }: Props) {
  return (
    <div className="flex flex-col mt-16">
      {/* Top promo */}
      <div className="mb-6">
        <Banner page={page} />
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
