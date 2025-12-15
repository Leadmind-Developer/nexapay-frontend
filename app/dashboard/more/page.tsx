"use client";

import React from "react";
import { Ionicons } from "react-icons/ion";
import colors from "@/theme/colors"; // keep old theme support
import { useRouter } from "next/navigation";

interface ServiceItem {
  name: string;
  screen: string;
  icon: string;
  color: string;
}

// Merged list from OLD + NEW
const MORE_SERVICES: ServiceItem[] = [
  { name: "Airtime", screen: "NexaAirtime", icon: "call-outline", color: "#4B7BE5" },
  { name: "Data Bundle", screen: "NexaData", icon: "wifi-outline", color: "#00A86B" },
  { name: "International Airtime", screen: "IntlAirtime", icon: "earth-outline", color: "#C67ACB" },
  { name: "Electricity Bills", screen: "Electricity", icon: "flash-outline", color: "#FFB300" },
  { name: "TV Subscription", screen: "CableTV", icon: "tv-outline", color: "#8A39E1" },
  { name: "Internet Subscription", screen: "Internet", icon: "globe-outline", color: "#0084FF" },
  { name: "Betting Wallet Topup", screen: "Betting", icon: "cash-outline", color: "#FF6F61" },
  { name: "Education Payments", screen: "Education", icon: "school-outline", color: "#1E90FF" },
  { name: "Insurance", screen: "Insurance", icon: "shield-checkmark-outline", color: colors.primary },
  { name: "International Transfer", screen: "IntlTransfer", icon: "globe-outline", color: "#0F9D58" },
  { name: "Web Services", screen: "Web", icon: "globe-outline", color: "#4285F4" },
];

export default function MoreServicesPage() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    // Adapt this depending on your routing system
    router.push(`/${screen}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex items-center bg-[#39358c] text-white px-4 py-3">
        <button onClick={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">More Services</h1>
        <div className="w-6" /> {/* Placeholder for centering */}
      </header>

      {/* BODY */}
      <main className="p-5 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600 mb-5">
          Explore more bill payments and utilities not shown on the home screen.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {MORE_SERVICES.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.screen)}
              className="flex flex-col items-center bg-white rounded-xl py-6 shadow-sm hover:shadow-md transition"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: item.color }}
              >
                <Ionicons name={item.icon} size={24} color="#fff" />
              </div>
              <span className="text-center text-sm font-semibold text-gray-800">{item.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
