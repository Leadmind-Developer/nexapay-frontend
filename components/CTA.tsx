"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 text-indigo-900 text-center">
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat bg-center"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6"
      >
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 leading-snug">
          Ready to Simplify Your Payments?
        </h2>

        {/* Subtext */}
        <p className="text-sm sm:text-base md:text-lg mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
          Pay bills, buy airtime, and data instantly — all in one place. Start using NexaPay today via WhatsApp, Telegram, or directly on our platform.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <motion.a
            href="https://wa.me/2348012345678"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg transition"
          >
            Chat on WhatsApp
          </motion.a>

          <motion.a
            href="https://t.me/NexaPayBot"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg transition"
          >
            Talk on Telegram
          </motion.a>

          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-indigo-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg transition"
          >
            Create Account
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
