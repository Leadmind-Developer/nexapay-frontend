"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Select Service", desc: "Choose Airtime, Data, Electricity, or Cable TV." },
  { title: "Enter Details", desc: "Input your phone number, account, or meter number." },
  { title: "Make Payment", desc: "Pay instantly via our secure payment gateway." },
  { title: "Get Confirmation", desc: "Receive instant receipts via WhatsApp or Telegram." },
];

export default function Steps() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold mb-12 text-gray-900"
      >
        How It Works
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="relative bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition w-72 sm:w-64 md:w-60 flex flex-col items-center"
          >
            <div className="absolute -top-5 bg-indigo-600 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-md">
              {idx + 1}
            </div>
            <h3 className="mt-6 text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
            <p className="text-gray-600 text-sm md:text-base">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
