"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Zap, CreditCard } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-10 h-10 text-indigo-600" />,
    title: "Instant Payments",
    desc: "Experience lightning-fast airtime, data, and bill payments — no delays, no hassle.",
  },
  {
    icon: <Smartphone className="w-10 h-10 text-indigo-600" />,
    title: "Multi-Channel Access",
    desc: "Transact easily through WhatsApp, Telegram, or our secure web dashboard.",
  },
  {
    icon: <CreditCard className="w-10 h-10 text-indigo-600" />,
    title: "All-in-One Platform",
    desc: "Buy airtime, data, electricity, cable TV, and more from one unified app.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-indigo-600" />,
    title: "Bank-Grade Security",
    desc: "Your transactions are encrypted and processed via trusted payment gateways.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-extrabold mb-12 text-gray-900 dark:text-white"
      >
        Why Choose <span className="text-indigo-600">NexaPay</span>?
      </motion.h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto px-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-8 transition-transform duration-300"
          >
            <div className="flex justify-center mb-5">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
