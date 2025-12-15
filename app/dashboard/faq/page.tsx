"use client";

import React from "react";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Nexa?",
      a: "Nexa is your all-in-one payments and utility platform for airtime, data, TV, electricity, and fund transfers.",
    },
    {
      q: "How do I fund my wallet?",
      a: "You can fund your wallet using debit cards, bank transfer, or other payment methods available on the app.",
    },
    {
      q: "Is Nexa secure?",
      a: "Yes. Nexa uses bank-grade encryption and supports biometric authentication for extra protection.",
    },
    {
      q: "What should I do if a transaction fails?",
      a: "If your transaction fails but you were debited, please contact support via the in-app chat or email us.",
    },
    {
      q: "Can I earn rewards?",
      a: "Yes! Nexa offers cashback and referral rewards for regular users and partners.",
    },
  ];

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-500 mb-4">
          Frequently Asked Questions
        </h1>
        {faqs.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-200"
          >
            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{item.q}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </ResponsiveLandingWrapper>
  );
}
