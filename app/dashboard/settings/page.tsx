"use client";

import React, { useEffect, useState } from "react";
import {
  IoMoon,
  IoFingerPrint,
  IoLockClosed,
  IoDocumentText,
  IoBook,
  IoChevronForward,
} from "react-icons/io5";
import api from "@/lib/api";
import OTPInput from "@/components/auth/OTPInput";

export default function SettingsPage() {
  // Preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFaceId, setIsFaceId] = useState(false);

  // Biometric support
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // 2FA state
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // -------------------------
  // Load persisted settings
  // -------------------------
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");

    if (window.PublicKeyCredential) setBiometricAvailable(true);

    // Optional: load biometric status from backend
    (async () => {
      try {
        const res = await api.get("/auth/biometric/status");
        if (res.data?.enabled !== undefined) {
          setIsFaceId(!!res.data.enabled);
        }
      } catch {
        // silent fail
      }
    })();
  }, []);

  // -------------------------
  // Theme toggle
  // -------------------------
  const handleThemeSwitch = async (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem("theme", value ? "dark" : "light");
    document.documentElement.classList.toggle("dark", value);
  };

  // -------------------------
  // Biometric toggle (wrapped with 2FA)
  // -------------------------
  const handleFaceIdToggle = async (value: boolean) => {
    if (value) {
      if (!window.PublicKeyCredential) {
        alert("Your device does not support biometrics.");
        return;
      }
    }

    const action = async () => {
      await api.post("/auth/biometric", { enabled: value });
      setIsFaceId(value);
      alert(`Biometric login ${value ? "enabled" : "disabled"}`);
    };

    await trigger2FAIfRequired(action);
  };

  // -------------------------
  // Reset PIN
  // -------------------------
  const handleResetPin = async () => {
    const action = async () => {
      await api.post("/auth/reset-pin");
      alert("PIN reset link sent!");
    };

    await trigger2FAIfRequired(action);
  };

  // -------------------------
  // Trigger 2FA if required
  // -------------------------
  const trigger2FAIfRequired = async (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setOtpMessage("");
    setOtpValue("");
    setOtpLoading(true);

    try {
      const res = await api.post("/auth/check-2fa");
      const data = res.data;

      if (data.totpRequired || data.pushRequired) {
        setTotpRequired(!!data.totpRequired);
        setPushRequired(!!data.pushRequired);
        setOtpMessage("⚡ Additional 2FA required. Approve push or enter TOTP.");
      } else {
        await action();
        setPendingAction(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error initiating 2FA.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------
  // Verify 2FA
  // -------------------------
  const handle2FAVerification = async (totpCode?: string) => {
    if (!pendingAction) return;

    setOtpLoading(true);
    try {
      const res = await api.post("/auth/verify-2fa", {
        totp: totpCode,
        push: pushRequired ? true : undefined,
      });

      if (res.data.success) {
        await pendingAction();
        setPendingAction(null);
        setTotpRequired(false);
        setPushRequired(false);
        setOtpMessage("");
      } else {
        alert(res.data.message || "2FA verification failed.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "2FA verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------
  // UI data
  // -------------------------
  const preferences = [
    {
      title: "Dark Mode",
      icon: <IoMoon size={20} />,
      value: isDarkMode,
      onChange: handleThemeSwitch,
    },
    {
      title: "Enable Face ID",
      icon: <IoFingerPrint size={20} />,
      value: isFaceId,
      onChange: handleFaceIdToggle,
      disabled: !biometricAvailable,
    },
  ];

  const securityItems = [
    {
      title: "Reset Transaction PIN",
      icon: <IoLockClosed size={20} />,
      onClick: handleResetPin,
    },
  ];

  const appInfoItems = [
    {
      title: "Privacy Policy",
      icon: <IoDocumentText size={20} />,
      onClick: () => alert("Navigate to Privacy Policy"),
    },
    {
      title: "Terms & Conditions",
      icon: <IoBook size={20} />,
      onClick: () => alert("Navigate to Terms & Conditions"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Preferences */}
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
              disabled={otpLoading || item.disabled}
            />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg shadow mb-4">
        <h2 className="text-gray-500 text-sm font-semibold px-4 py-2">Security</h2>
        {securityItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            disabled={otpLoading}
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

      {/* 2FA Modal */}
      {pendingAction && (totpRequired || pushRequired) && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          {totpRequired && (
            <>
              <p className="text-sm text-gray-700 mb-1">
                Enter code from authenticator app
              </p>
              <OTPInput
                length={6}
                value={otpValue}
                onChange={setOtpValue}
                disabled={otpLoading}
              />
              <button
                className="mt-2 py-2 px-4 bg-purple-600 text-white rounded"
                onClick={() => handle2FAVerification(otpValue)}
                disabled={otpLoading || otpValue.length < 6}
              >
                {otpLoading ? "Verifying..." : "Verify TOTP"}
              </button>
            </>
          )}

          {pushRequired && (
            <>
              <p className="text-sm text-gray-700 mt-2">
                A push notification has been sent. Approve to continue.
              </p>
              {biometricAvailable && (
                <p className="text-sm text-gray-500">
                  Or confirm using device biometric
                </p>
              )}
              <button
                className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded"
                onClick={() => handle2FAVerification()}
                disabled={otpLoading}
              >
                {otpLoading ? "Waiting..." : "Confirm Push / Biometric"}
              </button>
            </>
          )}

          {otpMessage && (
            <p className="text-sm text-green-600 mt-1">{otpMessage}</p>
          )}
        </div>
      )}

      {/* App Info */}
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

      <p className="text-center text-gray-400 text-sm mt-6">
        App version 1.0.0
      </p>
    </div>
  );
}
