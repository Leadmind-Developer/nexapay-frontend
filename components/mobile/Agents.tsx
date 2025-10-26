"use client";

import { motion } from "framer-motion";
import { Users, Wallet, Headphones } from "lucide-react";

const agentBenefits = [
  {
    icon: Users,
    title: "Earn Commission",
    desc: "Make money on every airtime, data, or bill payment transaction.",
  },
  {
    icon: Wallet,
    title: "Easy Wallet Funding",
    desc: "Fund your wallet easily via transfer or card payment — anytime.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    desc: "Enjoy 24/7 agent support for all transactions and settlements.",
  },
];

export default function Agents() {
  return (
    <section
      className="relative py-16 sm:py-20 
                 bg-gradient-to-b from-white to-indigo-50 
                 dark:from-gray-950 dark:to-gray-900 
                 text-center overflow-hidden"
    >
      {/* 🌟 Subtle animated glow background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))]
                   from-indigo-300/20 via-transparent to-transparent pointer-events-none"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* 🏷️ Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 
                   text-gray-900 dark:text-white z-10"
      >
        Become a NexaPay Agent
      </motion.h2>

      {/* 💼 Benefit Cards */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 max-w-6xl mx-auto px-6">
        {agentBenefits.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="bg-white dark:bg-gray-900 
                       p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-lg 
                       dark:hover:shadow-indigo-700/10
                       border border-gray-100 dark:border-gray-800
                       w-full sm:w-72 transition flex flex-col items-center"
          >
            <item.icon className="w-10 h-10 text-indigo-600 dark:text-yellow-400 mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {item.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 🚀 CTA Button */}
      <motion.a
        href="/agents"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 mt-10 inline-block 
                   bg-indigo-600 dark:bg-yellow-400 
                   text-white dark:text-gray-900 
                   px-8 py-3 rounded-full font-semibold 
                   shadow hover:bg-indigo-700 dark:hover:bg-yellow-300
                   transition"
      >
        Join as an Agent
      </motion.a>
    </section>
  );
}
