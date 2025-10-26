"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Select Service",
    desc: "Choose Airtime, Data, Electricity, or Cable TV.",
  },
  {
    title: "Enter Details",
    desc: "Input your phone number, account, or meter number.",
  },
  {
    title: "Make Payment",
    desc: "Pay instantly via our secure payment gateway.",
  },
  {
    title: "Get Confirmation",
    desc: "Receive instant receipts via WhatsApp or Telegram.",
  },
];

export default function Steps() {
  return (
    <section
      className="py-16 sm:py-20 bg-gradient-to-b 
                 from-white to-indigo-50 
                 dark:from-gray-950 dark:to-gray-900 
                 text-center relative overflow-hidden"
    >
      {/* ✨ Soft glowing background accent */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
                   from-indigo-300/20 via-transparent to-transparent pointer-events-none"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* 🏷️ Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative text-2xl sm:text-3xl font-bold mb-8 sm:mb-12
                   text-gray-900 dark:text-white z-10"
      >
        How It Works
      </motion.h2>

      {/* 🔹 Steps Grid */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 max-w-6xl mx-auto px-6 sm:px-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="relative bg-white dark:bg-gray-900 
                       p-6 sm:p-8 rounded-2xl shadow-md 
                       hover:shadow-lg dark:hover:shadow-indigo-700/10
                       transition w-full sm:w-64 md:w-60 
                       flex flex-col items-center text-center border border-gray-100 dark:border-gray-800"
          >
            {/* Step number badge */}
            <div
              className="absolute -top-5 bg-indigo-600 dark:bg-yellow-400
                         text-white dark:text-gray-900
                         text-lg font-bold w-10 h-10 rounded-full 
                         flex items-center justify-center shadow-md"
            >
              {idx + 1}
            </div>

            {/* Step title */}
            <h3
              className="mt-6 text-lg sm:text-xl font-semibold mb-2
                         text-gray-900 dark:text-gray-100"
            >
              {step.title}
            </h3>

            {/* Step description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
