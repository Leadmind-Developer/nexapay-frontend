"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import LandingPageMobile from "@/app/LandingPageMobile";
import LandingShell from "@/components/layouts/LandingShell";

interface Props {
  children: ReactNode;
}

export default function ResponsiveLandingWrapper({ children }: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Detect mobile vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ Measure header height on desktop
  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => setHeaderHeight(headerRef.current?.offsetHeight || 0);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // ✅ Avoid hydration mismatch
  if (isMobile === null) return null;

  // ✅ Mobile layout
  if (isMobile) {
    return <LandingPageMobile>{children}</LandingPageMobile>;
  }

  // ✅ Desktop layout with fixed header offset
  return (
    <div className="relative w-full min-h-screen">
      {/* Fixed header */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <LandingShell.Header />
      </div>

      {/* Page content padded below header */}
      <div style={{ paddingTop: `${headerHeight}px` }}>
        {children}
      </div>
    </div>
  );
}
