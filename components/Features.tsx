"use client";

import { motion } from "framer-motion";

const features = [
  { icon: "⚡", title: "Instant Payment", desc: "Fast, reliable, and secure transactions." },
  { icon: "📱", title: "Multi-Channel", desc: "Pay via Mobile app, WhatsApp, Telegram, or directly here." },
  { icon: "💳", title: "Multiple Services", desc: "Airtime, Data, Electricity, Cable TV, and more." },
  { icon: "🔒", title: "Secure", desc: "We use trusted payment gateways & encryption." },
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-10">Why Choose NexaPay</h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg w-64"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
