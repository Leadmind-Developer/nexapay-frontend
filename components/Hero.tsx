"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Tv, PlugZap, Apple } from "lucide-react";

export default function Hero() {
  const [service, setService] = useState("Airtime");

  const services = [
    { name: "Airtime", icon: <Smartphone className="w-5 h-5" /> },
    { name: "Data", icon: <Zap className="w-5 h-5" /> },
    { name: "Electricity", icon: <PlugZap className="w-5 h-5" /> },
    { name: "Cable", icon: <Tv className="w-5 h-5" /> },
  ];

  return (
    <section className="relative overflow-hidden text-left py-32 sm:py-24 min-h-[600px] w-full">
      {/* Background image on desktop only */}
      <div
        className="hidden sm:block absolute inset-0 bg-contain bg-right bg-no-repeat"
        style={{
          top: "80px",
          bottom: 0,
          width: "100%",
          backgroundImage: "url('/hero-bg.png')",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/90 to-transparent"></div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-200/20 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-full px-4 sm:px-12 mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight text-indigo-900 text-left sm:text-left"
        >
          Simplify Your Payments with
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight text-yellow-300 text-center sm:text-left inline-flex items-center gap-1 justify-center sm:justify-start"
        >
          NexaPay <Sparkles className="w-5 h-5 inline" />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-base sm:text-lg text-indigo-900 mb-10 leading-relaxed w-full sm:max-w-3xl"
        >
          Buy airtime, data, electricity, or cable TV instantly — directly on our site, mobile app, via WhatsApp, or Telegram.
        </motion.p>

        {/* Service buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-start flex-wrap gap-3 mb-10"
        >
          {services.map((s) => (
            <button
              key={s.name}
              onClick={() => setService(s.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                service === s.name
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "bg-indigo-500/40 hover:bg-indigo-400/60 border border-white/20"
              }`}
            >
              {s.icon}
              {s.name}
            </button>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-start gap-5 flex-wrap"
        >
          <a
            href="https://wa.me/2348012345678?text=Hi%20I%20want%20to%20buy%20some%20services"
            target="_blank"
            className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
          >
            WhatsApp
          </a>
          <a
            href="https://t.me/NexaPayBot"
            target="_blank"
            className="bg-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
          >
            Telegram
          </a>
          <a
            href="https://apps.apple.com/app/idYOUR_APP_ID"
            target="_blank"
            className="bg-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2 text-white"
          >
            <Apple className="w-5 h-5" /> iOS
          </a>
        </motion.div>
      </div>
    </section>
  );
}
