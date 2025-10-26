"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Tv, PlugZap, Apple } from "lucide-react";

export default function NewUpdate() {
  const [service, setService] = useState("Airtime");

  const services = [
    { name: "Airtime", icon: <Smartphone className="w-5 h-5" /> },
    { name: "Data", icon: <Zap className="w-5 h-5" /> },
    { name: "Electricity", icon: <PlugZap className="w-5 h-5" /> },
    { name: "Cable", icon: <Tv className="w-5 h-5" /> },
  ];

  return (
    <section className="relative overflow-hidden min-h-[400px] w-full flex items-center justify-center bg-gradient-to-r from-indigo-50 to-white">
      {/* Decorative shimmer */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-200/20 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      <div className="relative z-10 w-full max-w-3xl px-6 sm:px-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold mb-3 text-indigo-900"
        >
          🚀 Big Update!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-base sm:text-lg mb-6 text-indigo-800"
        >
          We’ve improved NexaPay performance and added new service options —
          now faster and smoother for all users.
        </motion.p>

        {/* Service buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center flex-wrap gap-3"
        >
          {services.map((s) => (
            <button
              key={s.name}
              onClick={() => setService(s.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all text-sm sm:text-base ${
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
      </div>
    </section>
  );
}
