"use client";

import { useEffect, useState, ReactNode } from "react";
import LandingPageMobile from "@/app/LandingPageMobile";
import FixedHeaderPage from "@/components/FixedHeaderPage";

interface Props {
  children: ReactNode;
}

export default function ResponsiveLandingWrapper({ children }: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Avoid hydration mismatch
  if (isMobile === null) return null;

  return isMobile ? (
    <LandingPageMobile>{children}</LandingPageMobile>
  ) : (
    <FixedHeaderPage>{children}</FixedHeaderPage>
  );
}
