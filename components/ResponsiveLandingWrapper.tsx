"use client";

import { useEffect, useState } from "react";
import LandingPageMobile from "@/app/LandingPageMobile";
import LandingShell from "@/components/layouts/LandingShell";

export default function ResponsiveLandingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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
    <LandingShell>{children}</LandingShell>
  );
}
