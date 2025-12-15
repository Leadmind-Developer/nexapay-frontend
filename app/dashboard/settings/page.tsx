"use client";

import React, { useEffect, useState } from "react";
import { IoMoon, IoFingerPrint, IoLockClosed, IoDocumentText, IoBook, IoChevronForward } from "react-icons/io5";
import { SessionManager } from "@/lib/SessionManager";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFaceId, setIsFaceId] = useState(false);

  // Load persisted settings
  useEffect(() => {
    (async () => {
      const bio = await SessionManager.isBiometricEnabled();
      setIsFaceId(bio);

      const theme = await SessionManager.getTheme?.();
      setIsDarkMode(theme === "dark");
    })();
  }, []);

  const handleThemeSwitch = async (value: boolean) => {
    setIsDarkMode(value);
    await SessionManager.setTheme?.(value ? "dark" : "light");
  };

  const handleFaceIdToggle = async (value: boolean) => {
    if (value) {
      const result = await SessionManager.authenticateWithBiometrics("Enable biometric login");
      if (!result.success) {
        alert(
          result.error === "not_available"
            ? "Your device does not support biometrics or none are enrolled."
            : "Authentication failed"
        );
        return;
      }
    }
    setIsFaceId(value);
    await SessionManager.enableBiometric(value);
    alert(`Biometric login ${value ? "enabled" : "disabled"}`);
  };

  const preferences = [
    { title: "Dark Mode", icon: <IoMoon size={20} />, value: isDarkMode, onChange: handleThemeSwitch },
    { title: "Enable Face ID", icon: <IoFingerPrint size={20} />, value: isFaceId, onChange: handleFaceIdToggle },
  ];

  const securityItems = [
    {
      title: "Reset Transaction PIN",
      icon: <IoLockClosed size={20} />,
      onClick: () => {
        const confirmReset = window.confirm("Would you like to reset your transaction PIN?");
        if (confirmReset) alert("PIN reset link sent!");
      },
    },
  ];

  const appInfoItems = [
    { title: "Privacy Policy", icon: <IoDocumentText size={20} />, onClick: () => alert("Navigate to Privacy Policy") },
    { title: "Terms & Conditions", icon: <IoBook size={20} />, onClick: () => alert("Navigate to Terms & Conditions") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Preferences Section */}
      <div className="bg-white rounded-lg shadow mb-4">
        <h2 className="text-gray-500 text-sm font-semibold px-4 py-2">Preferences</h2>
        {preferences.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-3 border-t first:border-t-0 border-gray-200"
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3 text-gray-800">{item.title}</span>
            </div>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => item.onChange(e.target.checked)}
              className="w-5 h-5 accent-blue-700"
            />
          </div>
        ))}
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow mb-4">
        <h2 className="text-gray-500 text-sm font-semibold px-4 py-2">Security</h2>
        {securityItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className="w-full flex items-center justify-between px-4 py-3 border-t first:border-t-0 border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3 text-gray-800">{item.title}</span>
            </div>
            <IoChevronForward size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* App Info Section */}
      <div className="bg-white rounded-lg shadow mb-4">
        <h2 className="text-gray-500 text-sm font-semibold px-4 py-2">App Info</h2>
        {appInfoItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className="w-full flex items-center justify-between px-4 py-3 border-t first:border-t-0 border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3 text-gray-800">{item.title}</span>
            </div>
            <IoChevronForward size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      <p className="text-center text-gray-400 text-sm mt-6">App version 1.0.0</p>
    </div>
  );
}
