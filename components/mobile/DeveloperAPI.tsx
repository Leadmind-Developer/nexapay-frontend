"use client";

import { motion } from "framer-motion";
import { Code, Zap, Lock } from "lucide-react";

const apiFeatures = [
  {
    icon: <Code className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3" />,
    title: "Easy Integration",
    desc: "Plug our RESTful API into your apps or websites in minutes.",
  },
  {
    icon: <Zap className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3" />,
    title: "Instant Transactions",
    desc: "Enjoy lightning-fast airtime, data, and bill payments via API.",
  },
  {
    icon: <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3" />,
    title: "Secure & Reliable",
    desc: "Protected with JWT authentication and HTTPS encryption.",
  },
];

export default function DeveloperAPI() {
  return (
    <section
      className="py-20 bg-indigo-50 dark:bg-gray-950 
                 text-center transition-colors duration-300"
    >
      {/* 🧠 Section Title */}
      <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white">
        Developer API Access
      </h2>

      {/* ⚙️ Feature Grid */}
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto px-4">
        {apiFeatures.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-white dark:bg-gray-900 
                       p-6 rounded-2xl shadow 
                       hover:shadow-lg transition 
                       w-full sm:w-72"
          >
            <div className="flex flex-col items-center text-center">
              {item.icon}
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 📘 CTA Button */}
      <motion.a
        href="/developer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="mt-10 inline-block bg-indigo-600 hover:bg-indigo-700 
                   text-white px-6 py-3 rounded-full font-medium shadow 
                   transition dark:hover:bg-indigo-500"
      >
        View API Docs
      </motion.a>
    </section>
  );
}
