"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Tv, PlugZap, Apple } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [service, setService] = useState("Airtime");

  const services = [
    { name: "Airtime", icon: <Smartphone className="w-5 h-5" /> },
    { name: "Data", icon: <Zap className="w-5 h-5" /> },
    { name: "Electricity", icon: <PlugZap className="w-5 h-5" /> },
    { name: "Cable", icon: <Tv className="w-5 h-5" /> },
  ];

  const handleServiceClick = (name: string) => {
    setService(name);

    if (name === "Airtime") {
      router.push("/airtime");
    }
  };

  return (
    <section className="relative overflow-hidden text-left py-24 min-h-[600px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-contain bg-right bg-no-repeat"
        style={{
          top: "80px",
          bottom: 0,
          width: "100%",
          backgroundImage: "url('/hero-bg.png')",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/90 to-transparent"></div>

      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-200/20 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      <div className="relative z-10 max-w-6xl px-12 lg:px-16">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-4 leading-tight text-indigo-900"
        >
          Simplify Your Payments with
        </motion.h1>

        {/* NexaPay */}
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl font-extrabold mb-6 leading-tight text-center text-yellow-300 inline-flex items-center gap-1 justify-center"
        >
          NexaPay <Sparkles className="w-5 h-5 inline" />
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg text-indigo-900 mb-10 leading-relaxed max-w-3xl"
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
              onClick={() => handleServiceClick(s.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                service === s.name
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "bg-indigo-500/40 hover:bg-indigo-400/60 border border-white/20 text-white"
              }`}
            >
              {s.icon}
              {s.name}
            </button>
          ))}
        </motion.div>

        {/* App / Chat buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-start gap-5 flex-wrap"
        >
          <a
            href="https://wa.me/2348012345678?text=Hi%20I%20want%20to%20buy%20some%20services"
            target="_blank"
            className="bg-green-500 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2 text-white"
          >
            WhatsApp
          </a>

          <a
            href="https://t.me/NexaPayBot"
            target="_blank"
            className="bg-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2 text-white"
          >
            Telegram
          </a>

          <a
            href="https://apps.apple.com/app/idYOUR_APP_ID"
            target="_blank"
            className="bg-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2 text-white"
          >
            <Apple className="w-5 h-5" /> iOS
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE"
            target="_blank"
            className="bg-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-900 transition flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
              <path d="M325.3 234.3L104.1 21.9c-5.9-5.9-15.3-5.3-20.3 1.3C77.5 28.3 64 52.6 64 80v352c0 27.4 13.5 51.7 19.8 57.8 5 6.6 14.4 7.2 20.3 1.3l221.2-212.4c8-7.7 8-20.7 0-28.4zM345.3 278.7c0 13.3-10.7 24-24 24h-16v-48h16c13.3 0 24 10.7 24 24z" />
            </svg>
            Android
          </a>
        </motion.div>
      </div>
    </section>
  );
}
