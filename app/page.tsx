"use client";

import { useEffect, useState, useRef } from "react";
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
  const [headerHeight, setHeaderHeight] = useState(0);

  // ✅ Redirect logged-in users
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/dashboard");
    } catch (err) {
      console.warn("Error accessing localStorage:", err);
    }
  }, [router]);

  // 🧭 Dynamically track total header height (including update bar)
  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => {
      const height = headerRef.current?.offsetHeight || 0;
      setHeaderHeight(height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);

    // Also update on window resize
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
        {/* 📍 Sidebar */}
        <LandingSidebar />

        {/* 🧭 Main Area */}
        <main className="flex-1 ml-32 flex flex-col relative">
          {/* 🔝 Fixed Header (tracks height automatically) */}
          <div
            ref={headerRef}
            className="fixed top-0 left-32 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <Header />
          </div>

          {/* 🚀 Page Content below header */}
          <div
            style={{ paddingTop: `${headerHeight}px` }}
            className="flex-grow"
          >
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 mb-24">
              <Hero />
            </section>

            {/* Core Landing Sections */}
            <section
              id="main-content"
              className="max-w-7xl mx-auto px-4 pb-16 space-y-20"
            >
              <Services />
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
