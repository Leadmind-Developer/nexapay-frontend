"use client";

import { motion } from "framer-motion";
import { Code, Zap, Lock } from "lucide-react";

const apiFeatures = [
  {
    icon: <Code className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Easy Integration",
    desc: "Plug our RESTful API into your apps or websites in minutes.",
  },
  {
    icon: <Zap className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Instant Transactions",
    desc: "Enjoy lightning-fast airtime, data, and bill payments via API.",
  },
  {
    icon: <Lock className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Secure & Reliable",
    desc: "Protected with JWT authentication and HTTPS encryption.",
  },
];

export default function DeveloperAPI() {
  return (
    <section className="py-20 bg-indigo-50 text-center">
      <h2 className="text-3xl font-bold mb-10">Developer API Access</h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {apiFeatures.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-white p-6 rounded-2xl shadow w-72 hover:shadow-lg transition"
          >
            <div className="flex flex-col items-center">
              {item.icon}
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.a
        href="/developer"
        whileHover={{ scale: 1.05 }}
        className="mt-10 inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow hover:bg-indigo-700 transition"
      >
        View API Docs
      </motion.a>
    </section>
  );
}
