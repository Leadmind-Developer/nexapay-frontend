"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Steps from "@/components/Steps";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Agents from "@/components/Agents";
import DeveloperAPI from "@/components/DeveloperAPI";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import LandingSidebar from "@/components/LandingSidebar";

export default function LandingPage() {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [servicesHeight, setServicesHeight] = useState(0);

  // ✅ Redirect logged-in users
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/dashboard");
    } catch (err) {
      console.warn("Error accessing localStorage:", err);
    }
  }, [router]);

  // 🧭 Track header height dynamically
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

  // 🧭 Track Services height for mobile placeholder
  useEffect(() => {
    if (!servicesRef.current) return;

    const updateHeight = () => setServicesHeight(servicesRef.current?.offsetHeight || 0);

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(servicesRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <>
      {/* 🌐 SEO */}
      <SEO
        title="NexaPay - Simplify Payments, Build Smarter"
        description="NexaPay helps you manage transactions, payments, and integrations securely — built for individuals, developers, and businesses."
        keywords="payments, fintech, API, developers, Nigeria, NexaPay"
        canonical="https://nexapay.app"
      />

      {/* ⚙️ Unified Layout */}
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* 📍 Sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <LandingSidebar />
        </div>

        {/* 🧭 Main Area */}
        <main className="flex-1 sm:ml-32 flex flex-col relative w-full">
          {/* 🔝 Fixed Header (tracks height automatically) */}
          <div
            ref={headerRef}
            className="fixed top-0 left-0 sm:left-32 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm w-full"
          >
            <Header />
          </div>

          {/* 🚀 Page Content below header */}
          <div style={{ paddingTop: `${headerHeight}px` }} className="flex-grow w-full">
            {/* Hero Section - full width on mobile */}
            <section className="w-full max-w-full px-4 sm:max-w-7xl sm:px-4 mb-24">
              <Hero />
            </section>

            {/* Core Landing Sections */}
            <section
              id="main-content"
              className="w-full max-w-full sm:max-w-7xl sm:px-4 mx-auto pb-16 space-y-20"
            >
              {/* Full Services on sm+ */}
              <div ref={servicesRef} className="hidden sm:block">
                <Services />
              </div>

              {/* Placeholder on mobile to maintain spacing */}
              <div className="block sm:hidden" style={{ height: `${servicesHeight}px` }} />

              <Steps />
              <Features />
              <Testimonials />
              <Agents />
              <DeveloperAPI />
              <CTA />
            </section>
          </div>

          {/* ⚓ Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}
