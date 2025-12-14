"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingSidebar from "@/components/LandingSidebar";

export default function LandingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;

    const update = () =>
      setHeaderHeight(headerRef.current?.offsetHeight || 0);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);

    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop only) */}
      <div className="hidden sm:block">
        <LandingSidebar />
      </div>

      <main className="flex-1 sm:ml-32 relative">
        {/* Header */}
        <div
          ref={headerRef}
          className="fixed top-0 left-0 sm:left-32 right-0 z-50 bg-white dark:bg-gray-900 border-b"
        >
          <Header />
        </div>

        {/* Content */}
        <div style={{ paddingTop: headerHeight }} className="min-h-screen">
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
}
