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
    <section className="py-16 sm:py-20 bg-gray-50 text-center">
      {/* Section Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-12 px-4 sm:px-0 leading-snug"
      >
        Why Choose NexaPay
      </motion.h2>

      {/* Features Grid */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 px-4 sm:px-0">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="bg-white w-full sm:w-[16rem] md:w-[18rem] p-6 rounded-xl shadow-md hover:shadow-lg transition transform cursor-default"
          >
            {/* Icon */}
            <div className="text-5xl sm:text-6xl mb-4">{feature.icon}</div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>

            {/* Description */}
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
