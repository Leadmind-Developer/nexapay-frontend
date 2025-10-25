"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SEO from "@/components/SEO";
import Header from "@/components/mobile/Header"; // Mobile version of Header
import Hero from "@/components/mobile/Hero";   // Mobile version of Hero
import Services from "@/components/mobile/Services"; // Mobile version of Services
import Steps from "@/components/mobile/Steps";    // Mobile version of Steps
import Features from "@/components/mobile/Features"; // Mobile version of Features
import Testimonials from "@/components/mobile/Testimonials"; // Mobile version of Testimonials
import Agents from "@/components/mobile/Agents";  // Mobile version of Agents
import DeveloperAPI from "@/components/mobile/DeveloperAPI"; // Mobile version of DeveloperAPI
import CTA from "@/components/mobile/CTA";      // Mobile version of CTA
import Footer from "@/components/Footer";      // Footer remains unchanged

export default function LandingPageMobile() {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Redirect logged-in users
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/dashboard");
    } catch (err) {
      console.warn("Error accessing localStorage:", err);
    }
  }, [router]);

  // Track header height
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
        <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm w-full">
          <Header />
        </div>

        {/* Page content */}
        <div style={{ paddingTop: `${headerHeight}px` }} className="flex flex-col w-full">
          {/* Remove headerHeight prop, Hero handles it internally now */}
          <Hero />
          <Services />
          <Steps />
          <Features />
          <Testimonials />
          <Agents />
          <DeveloperAPI />
          <CTA />
        </div>

        <Footer />
      </div>
    </>
  );
}
