"use client";

import React from "react";
import { useRouter } from "next/navigation";
import colors from "@/theme/colors";

import {
  IoArrowBack,
  IoCallOutline,
  IoWifiOutline,
  IoEarthOutline,
  IoFlashOutline,
  IoTvOutline,
  IoGlobeOutline,
  IoCashOutline,
  IoSchoolOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

/* --------------------------------
   Icon Map
-------------------------------- */
const ICONS = {
  call: IoCallOutline,
  wifi: IoWifiOutline,
  earth: IoEarthOutline,
  flash: IoFlashOutline,
  tv: IoTvOutline,
  globe: IoGlobeOutline,
  cash: IoCashOutline,
  school: IoSchoolOutline,
  shield: IoShieldCheckmarkOutline,
};

type IconKey = keyof typeof ICONS;

/* --------------------------------
   Types
-------------------------------- */
interface ServiceItem {
  name: string;
  screen: string;
  icon: IconKey;
  color: string;
}

/* --------------------------------
   Services
-------------------------------- */
const MORE_SERVICES: ServiceItem[] = [
  {
    name: "Airtime",
    screen: "/airtime",
    icon: "call",
    color: "#4B7BE5",
  },
  {
    name: "Data Bundle",
    screen: "/data",
    icon: "wifi",
    color: "#00A86B",
  },
  {
    name: "International Airtime",
    screen: "/IntAirtime",
    icon: "earth",
    color: "#C67ACB",
  },
  {
    name: "Electricity Bills",
    screen: "/electricity",
    icon: "flash",
    color: "#FFB300",
  },
  {
    name: "TV Subscription",
    screen: "/cable",
    icon: "tv",
    color: "#8A39E1",
  },
  {
    name: "Education Payments",
    screen: "/education",
    icon: "school",
    color: "#1E90FF",
  },
  {
    name: "Insurance",
    screen: "/insurance",
    icon: "shield",
    color: colors.primary,
  },

  // ─────── Coming Soon ───────
  {
    name: "IT Services",
    screen: "/coming-soon",
    icon: "globe",
    color: "#0084FF",
  },
  {
    name: "Registration",
    screen: "/coming-soon",
    icon: "cash",
    color: "#FF6F61",
  },
  {
    name: "International Transfer",
    screen: "/coming-soon",
    icon: "globe",
    color: "#0F9D58",
  },
  {
    name: "Web Services",
    screen: "/coming-soon",
    icon: "globe",
    color: "#4285F4",
  },
];

export default function MoreServicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex items-center bg-[#39358c] text-white px-4 py-3">
        <button onClick={() => router.back()} className="mr-4">
          <IoArrowBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">
          More Services
        </h1>
        <div className="w-6" />
      </header>

      {/* BODY */}
      <main className="p-5 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600 mb-5">
          Explore more bill payments and utilities not shown on the home screen.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {MORE_SERVICES.map((item) => {
            const Icon = ICONS[item.icon];

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.screen)}
                className="flex flex-col items-center bg-white rounded-xl py-6 shadow-sm hover:shadow-md transition"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon size={24} color="#fff" />
                </div>
                <span className="text-center text-sm font-semibold text-gray-800">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
