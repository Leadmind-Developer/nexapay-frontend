"use client";

import { useEffect, useState } from "react";
import LandingPageMobile from "@/app/LandingPageMobile";
import LandingShell from "@/components/layouts/LandingShell";

export default function ResponsiveLandingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 📱 Mobile → use full mobile landing
  if (isMobile) {
    return <LandingPageMobile>{children}</LandingPageMobile>;
  }

  // 🖥 Desktop → use landing shell
  return <LandingShell>{children}</LandingShell>;
}
