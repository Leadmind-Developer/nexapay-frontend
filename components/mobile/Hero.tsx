"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Tv, PlugZap, Apple } from "lucide-react";

export default function Hero() {
  const [service, setService] = useState("Airtime");
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const services = [
    { name: "Airtime", icon: <Smartphone className="w-5 h-5" /> },
    { name: "Data", icon: <Zap className="w-5 h-5" /> },
    { name: "Electricity", icon: <PlugZap className="w-5 h-5" /> },
    { name: "Cable", icon: <Tv className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (headerRef.current) {
      const updateHeight = () =>
        setHeaderHeight(headerRef.current?.offsetHeight || 0);
      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(headerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <section
      ref={headerRef}
      style={{ paddingTop: `${headerHeight}px` }}
      className="relative overflow-hidden pt-8 pb-16 sm:pt-20 sm:pb-24 min-h-[520px]
                 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900
                 flex flex-col justify-center"
    >
      {/* ✅ Animated Mobile Background Image */}
      <motion.div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain sm:hidden"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "contain",
        }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* ✅ Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white dark:from-gray-950/90 dark:to-gray-900/95"></div>

      {/* ✅ Subtle shimmer accent */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
                   from-indigo-300/20 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-3 text-gray-900 dark:text-white leading-tight"
        >
          Simplify Your Payments with
        </motion.h1>

        {/* Highlighted brand */}
        <motion.h2
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-6 text-indigo-600 dark:text-yellow-400 inline-flex items-center gap-1 justify-center"
        >
          NexaPay <Sparkles className="w-5 h-5 inline" />
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Buy airtime, data, electricity, or cable TV instantly — right here or through our app, WhatsApp, or Telegram.
        </motion.p>

        {/* Service buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center flex-wrap gap-3 mb-10"
        >
          {services.map((s) => (
            <button
              key={s.name}
              onClick={() => setService(s.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all
                ${
                  service === s.name
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-700"
                }`}
            >
              {s.icon}
              {s.name}
            </button>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-center gap-3 flex-wrap"
        >
          <a
            href="https://wa.me/2348012345678?text=Hi%20I%20want%20to%20buy%20some%20services"
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white px-7 py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base transition"
          >
            WhatsApp
          </a>

          <a
            href="https://t.me/NexaPayBot"
            target="_blank"
            className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base transition"
          >
            Telegram
          </a>

          <a
            href="https://apps.apple.com/app/idYOUR_APP_ID"
            target="_blank"
            className="bg-black hover:bg-gray-800 text-white px-7 py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base transition"
          >
            <Apple className="w-5 h-5" /> iOS
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE"
            target="_blank"
            className="bg-black hover:bg-gray-900 text-white px-7 py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base transition"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 512 512"
              fill="currentColor"
            >
              <path d="M325.3 234.3L104.1 21.9c-5.9-5.9-15.3-5.3-20.3 1.3C77.5 28.3 64 52.6 64 80v352c0 27.4 13.5 51.7 19.8 57.8 5 6.6 14.4 7.2 20.3 1.3l221.2-212.4c8-7.7 8-20.7 0-28.4zM345.3 278.7c0 13.3-10.7 24-24 24h-16v-48h16c13.3 0 24 10.7 24 24z" />
            </svg>
            Android
          </a>
        </motion.div>
      </div>
    </section>
  );
}
