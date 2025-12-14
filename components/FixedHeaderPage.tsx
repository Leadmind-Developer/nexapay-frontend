"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Header from "@/components/Header";

export default function FixedHeaderPage({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () =>
      setHeaderHeight(headerRef.current?.offsetHeight || 0);

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);

    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b"
      >
        <Header />
      </div>

      {/* Content pushed below header */}
      <main style={{ paddingTop: `${headerHeight}px` }}>
        {children}
      </main>
    </div>
  );
}
