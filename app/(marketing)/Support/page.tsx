"use client";

import React from "react";
import { useRouter } from "next/navigation";
import colors from "@/theme/colors";

export default function SupportPage() {
  const router = useRouter();

  const openWhatsApp = () => {
    window.open("https://wa.me/2347016075305?text=Hello Nexa Support!", "_blank");
  };

  const openEmail = () => {
    window.location.href = "mailto:support@nexaapp.com?subject=Nexa App Support";
  };

  const openFAQ = () => {
    router.push("/faq"); // Navigate to FAQ page
  };

  const openCall = () => {
    window.location.href = "tel:+2347016075305";
  };

  const items = [
    { icon: "❓", title: "FAQs", onClick: openFAQ },
    { icon: "💬", title: "Chat on WhatsApp", onClick: openWhatsApp },
    { icon: "📞", title: "Call Support", onClick: openCall },
    { icon: "✉️", title: "Email Us", onClick: openEmail },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="flex flex-col items-center justify-center py-20 rounded-b-3xl"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="text-white text-6xl">🎧</div>
        <h1 className="text-white text-2xl font-bold mt-4">We’re here to help!</h1>
        <p className="text-white text-sm text-center mt-2 max-w-xs">
          Reach us through any of the support channels below.
        </p>
      </div>

      <div className="mt-6 space-y-4 px-4">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className="flex items-center justify-between bg-white rounded-xl p-4 shadow hover:bg-gray-50 w-full"
          >
            <div className="flex items-center">
              <span className="text-2xl">{item.icon}</span>
              <span className="ml-4 text-gray-800 font-medium">{item.title}</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-8 mb-6">
        Support hours: Mon–Fri, 8:00 AM – 8:00 PM
      </p>
    </div>
  );
}
