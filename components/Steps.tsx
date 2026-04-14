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
        
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 text-white">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-3xl md:text-4xl font-bold text-center mb-4"
  >
    Create, Promote & Sell Out Your Events
  </motion.h2>

  <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.1 }}
    className="text-center text-gray-300 max-w-2xl mx-auto mb-12 px-4"
  >
    Launch your event in minutes, reach thousands of attendees, and manage everything from ticket sales to check-ins — all in one place.
  </motion.p>

  <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
    {[
      {
        title: "Create Events Fast",
        desc: "Set up physical or virtual events in minutes with simple tools.",
      },
      {
        title: "Sell Tickets Instantly",
        desc: "Accept secure payments via multiple trusted payment providers.",
      },
      {
        title: "Grow Your Audience",
        desc: "Get discovered by users actively searching for events like yours.",
      },
    ].map((item, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: idx * 0.15 }}
        className="relative bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition w-72 sm:w-64 md:w-60 flex flex-col items-center text-center"
      >
        <div className="absolute -top-5 bg-indigo-600 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-md">
          {idx + 1}
        </div>

        <h3 className="mt-6 text-xl font-semibold mb-2 text-white">
          {item.title}
        </h3>

        <p className="text-gray-300 text-sm md:text-base">
          {item.desc}
        </p>
      </motion.div>
    ))}
  </div>

  {/* CTA BUTTON */}
  <div className="mt-12 text-center">
    <a
      href="/organizer/events"
      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition"
    >
      Launch Your Event →
    </a>
  </div>
</section>
}
