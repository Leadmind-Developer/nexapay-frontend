"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import NewUpdate from "@/components/NewUpdate";
import TopNavBar from "@/components/TopNavBar";

export default function Header({ setHeaderHeight }: { setHeaderHeight: (height: number) => void }) {
  const newUpdateRef = useRef<HTMLDivElement | null>(null);

  // Dynamically measure NewUpdate height
  useEffect(() => {
    if (!newUpdateRef.current) return;

    const updateHeight = () => {
      const height = newUpdateRef.current.offsetHeight;
      setHeaderHeight(height);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(newUpdateRef.current);

    return () => observer.disconnect();
  }, [setHeaderHeight]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div ref={newUpdateRef}>
        <NewUpdate />
      </div>

      <div className="backdrop-blur-md bg-indigo-900/95 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 md:py-4">
          <TopNavBar />
        </div>
      </div>
    </header>
  );
}
