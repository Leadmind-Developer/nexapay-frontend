"use client";

import { motion } from "framer-motion";
import { Users, Wallet, Headphones } from "lucide-react";

const agentBenefits = [
  {
    icon: <Users className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Earn Commission",
    desc: "Make money on every airtime, data, or bill payment transaction.",
  },
  {
    icon: <Wallet className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Easy Wallet Funding",
    desc: "Fund your wallet easily via transfer or card payment — anytime.",
  },
  {
    icon: <Headphones className="w-10 h-10 text-indigo-600 mb-3" />,
    title: "Priority Support",
    desc: "Enjoy 24/7 agent support for all transactions and settlements.",
  },
];

export default function Agents() {
  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold mb-10">Become a NexaPay Agent</h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {agentBenefits.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-indigo-50 p-6 rounded-2xl shadow w-72 hover:shadow-lg transition"
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
        href="/agents"
        whileHover={{ scale: 1.05 }}
        className="mt-10 inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow hover:bg-indigo-700 transition"
      >
        Join as an Agent
      </motion.a>
    </section>
  );
}

