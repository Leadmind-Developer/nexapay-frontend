"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SEO from "@/components/SEO";
import Header from "@/components/mobile/Header";
import Hero from "@/components/mobile/Hero";
import Services from "@/components/mobile/Services";
import Steps from "@/components/mobile/Steps";
import Features from "@/components/mobile/Features";
import Testimonials from "@/components/mobile/Testimonials";
import Agents from "@/components/mobile/Agents";
import DeveloperAPI from "@/components/mobile/DeveloperAPI";
import CTA from "@/components/mobile/CTA";
import Footer from "@/components/Footer";

interface LandingPageMobileProps {
  children?: React.ReactNode;
}

export default function LandingPageMobile({
  children,
}: LandingPageMobileProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Redirect logged-in users (only for main landing, not wrapped pages)
  useEffect(() => {
    if (children) return;

    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/dashboard");
    } catch (err) {
      console.warn("Error accessing localStorage:", err);
    }
  }, [router, children]);

  // Track header height
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
    <>
      <SEO
        title="NexaPay - Simplify Payments, Build Smarter"
        description="NexaPay helps you manage transactions, payments, and integrations securely — built for individuals, developers, and businesses."
        keywords="payments, fintech, API, developers, Nigeria, NexaPay"
        canonical="https://nexapay.app"
      />

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 w-full">
        {/* Header */}
        <div
          ref={headerRef}
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm w-full"
        >
          <Header />
        </div>

        {/* Page content */}
        <div
          style={{ paddingTop: headerHeight }}
          className="flex flex-col w-full"
        >
          {children ? (
            children
          ) : (
            <>
              <Hero />
              <Services />
              <Steps />
              <Features />
              <Testimonials />
              <Agents />
              <DeveloperAPI />
              <CTA />
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
