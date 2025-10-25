"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "Alice", message: "NexaPay is super fast and reliable. I pay all my bills instantly!" },
  { name: "Bob", message: "Love the WhatsApp and Telegram payment options. Very convenient!" },
  { name: "Chidi", message: "Customer support is top-notch, and the app is easy to use." },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-indigo-50 text-center">
      <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto px-4">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.3 }}
            className="bg-white p-6 rounded-lg shadow w-full sm:w-80 hover:shadow-lg transition"
          >
            <p className="text-gray-800 italic mb-4 text-sm sm:text-base">"{t.message}"</p>
            <p className="font-semibold text-sm sm:text-base">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
