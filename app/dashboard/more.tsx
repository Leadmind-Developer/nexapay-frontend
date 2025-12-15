"use client";

import React from "react";
import { IoPersonCircleOutline, IoShieldCheckmarkOutline, IoGiftOutline, IoSettingsOutline, IoNotificationsOutline, IoHelpCircleOutline, IoDocumentTextOutline, IoReaderOutline, IoInformationCircleOutline, IoHeadsetOutline, IoShareSocialOutline, IoLogOutOutline, IoChevronForwardOutline } from "react-icons/io5";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";

export default function MorePage() {
  const firstName = "Steve"; // Replace with dynamic user data

  const handleLogout = () => {
    localStorage.clear();
    alert("You’ve been logged out successfully.");
    window.location.href = "/login";
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: "Nexa App",
        text: "🔥 Download Nexa App — pay bills, buy data, and send money instantly!",
        url: "https://nexaapp.link/download",
      }) || alert("Sharing is not supported in this browser.");
    } catch (error) {
      console.error("Error sharing app:", error);
    }
  };

  const profileGroup = [
    { icon: <IoPersonCircleOutline size={22} />, title: "Profile", href: "/profile" },
    { icon: <IoShieldCheckmarkOutline size={22} />, title: "Security", href: "/security" },
    { icon: <IoGiftOutline size={22} />, title: "Rewards", href: "/rewards" },
  ];

  const appSettingsGroup = [
    { icon: <IoSettingsOutline size={22} />, title: "Settings", href: "/settings" },
    { icon: <IoNotificationsOutline size={22} />, title: "Notifications", href: "/notifications" },
  ];

  const infoGroup = [
    { icon: <IoHelpCircleOutline size={22} />, title: "FAQ", href: "/faq" },
    { icon: <IoDocumentTextOutline size={22} />, title: "Privacy Policy", href: "/privacy-policy" },
    { icon: <IoReaderOutline size={22} />, title: "Terms of Service", href: "/terms" },
    { icon: <IoInformationCircleOutline size={22} />, title: "About Nexa", href: "/about" },
    { icon: <IoHeadsetOutline size={22} />, title: "Support", href: "/support" },
  ];

  const shareLogoutGroup = [
    { icon: <IoShareSocialOutline size={22} />, title: "Share App", onClick: handleShare },
    { icon: <IoLogOutOutline size={22} />, title: "Logout", onClick: handleLogout, color: "text-red-600" },
  ];

  const renderGroup = (title: string, items: any[]) => (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow divide-y divide-gray-100 dark:divide-gray-700">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold px-5 py-2">{title}</p>
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.href || "#"}
          onClick={item.onClick}
          className={`flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${item.color || "text-gray-900 dark:text-gray-100"}`}
        >
          {item.icon}
          <span className={`ml-3 flex-1 ${item.color ? item.color : ""}`}>{item.title}</span>
          <IoChevronForwardOutline className="text-gray-400 dark:text-gray-300" />
        </a>
      ))}
    </div>
  );

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl text-center py-12 shadow-md">
          <IoPersonCircleOutline size={70} className="mx-auto text-white" />
          <h1 className="mt-4 text-white text-2xl font-bold">Hi, {firstName} 👋</h1>
          <p className="mt-1 text-gray-200">Your trusted payment companion</p>
        </div>

        {/* Groups */}
        {renderGroup("Account", profileGroup)}
        {renderGroup("App", appSettingsGroup)}
        {renderGroup("Information", infoGroup)}
        {renderGroup("General", shareLogoutGroup)}

        {/* Version */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Nexa App v1.0.0
        </p>
      </div>
    </ResponsiveLandingWrapper>
  );
}
