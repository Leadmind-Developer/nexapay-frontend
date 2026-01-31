"use client";

import React from "react";
import { IoCashOutline, IoPeopleOutline, IoRibbonOutline } from "react-icons/io5";

const rewards = [
  { title: "Cashback Bonus", description: "Earn ₦50 for every ₦1000 spent on services.", icon: <IoCashOutline size={28} className="text-blue-700" /> },
  { title: "Referral Program", description: "Invite friends and get ₦200 when they make their first purchase.", icon: <IoPeopleOutline size={28} className="text-blue-700" /> },
  { title: "Loyalty Level", description: "You’re a Silver Member. Spend ₦5,000 more to reach Gold.", icon: <IoRibbonOutline size={28} className="text-blue-700" /> },
];

export default function RewardsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-blue-700 mb-6">Your Rewards</h1>

      <div className="space-y-4">
        {rewards.map((reward, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow flex items-start gap-4">
            <div>{reward.icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{reward.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{reward.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
        Redeem Rewards
      </button>
    </div>
  );
}
