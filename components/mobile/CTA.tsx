"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24
                 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50
                 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
                 text-center"
    >
      {/* 🌟 Pattern background */}
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat dark:opacity-5"></div>

      {/* 🌈 Animated glow overlay */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]
                   from-indigo-300/20 via-transparent to-transparent pointer-events-none"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-xl sm:max-w-3xl mx-auto px-6"
      >
        {/* 🏷️ Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white">
          Ready to Simplify Your Payments?
        </h2>

        {/* 💬 Subtext */}
        <p className="text-lg sm:text-xl mb-8 sm:mb-10 text-gray-700 dark:text-gray-300">
          Pay bills, buy airtime, and data instantly — all in one place.  
          Start using NexaPay today via WhatsApp, Telegram, or directly here.
        </p>

        {/* 🚀 Buttons */}
        <div className="flex flex-col sm:flex-row justify-center sm:gap-5 gap-4">
          <motion.a
            href="https://wa.me/2348012345678"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white 
                       px-8 py-4 rounded-xl font-semibold shadow-lg 
                       transition w-full sm:w-auto"
          >
            Chat on WhatsApp
          </motion.a>

          <motion.a
            href="https://t.me/NexaPayBot"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white 
                       px-8 py-4 rounded-xl font-semibold shadow-lg 
                       transition w-full sm:w-auto"
          >
            Talk on Telegram
          </motion.a>

          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white dark:bg-indigo-600 
                       text-indigo-700 dark:text-white 
                       hover:bg-indigo-100 dark:hover:bg-indigo-500 
                       px-8 py-4 rounded-xl font-semibold shadow-lg 
                       transition w-full sm:w-auto"
          >
            Create Account
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
