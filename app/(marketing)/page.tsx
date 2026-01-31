// app/(marketing)/page.tsx
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Steps from "@/components/Steps";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";

// Dynamically load heavy components for performance
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: true });
const Agents = dynamic(() => import("@/components/Agents"), { ssr: true });
const DeveloperAPI = dynamic(() => import("@/components/DeveloperAPI"), { ssr: true });

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="w-full border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <Header />
      </header>

      {/* Hero Section - main H1 for SEO */}
      <main className="flex-1 flex flex-col w-full">
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
          <Hero />
        </section>

        {/* Core landing sections */}
        <section className="w-full max-w-7xl mx-auto px-4 space-y-20 pb-16">
          <Services />
          <Steps />
          <Features />
          <Testimonials />
          <Agents />
          <DeveloperAPI />
          <CTA />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
