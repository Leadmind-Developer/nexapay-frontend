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
  const [darkMode, setDarkMode] = useState(false);

  // 📱 Detect mobile vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 🌙 Dark mode handling
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  // Optional: function to toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // 📱 Mobile → full mobile landing
  if (isMobile) {
    return <LandingPageMobile>{children}</LandingPageMobile>;
  }

  // 🖥 Desktop → landing shell with dark mode
  return <LandingShell>{children}</LandingShell>;
}
