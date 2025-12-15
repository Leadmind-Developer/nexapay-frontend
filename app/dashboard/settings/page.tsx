"use client";

import React, { useEffect, useState } from "react";
import { 
  IoMoon, IoFingerPrint, IoLockClosed, 
  IoDocumentText, IoBook, IoChevronForward 
} from "react-icons/io5";
import { SessionManager } from "@/lib/SessionManager";
import api from "@/lib/api";
import OTPInput from "@/components/OTPInput";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFaceId, setIsFaceId] = useState(false);

  // 2FA state
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Load persisted settings
  useEffect(() => {
    (async () => {
      const bio = await SessionManager.isBiometricEnabled();
      setIsFaceId(bio);

      const theme = await SessionManager.getTheme?.();
      setIsDarkMode(theme === "dark");

      if (window.PublicKeyCredential) setBiometricAvailable(true);
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

    // Wrap the action to handle potential server-side 2FA
    const action = async () => {
      setIsFaceId(value);
      await SessionManager.enableBiometric(value);
      alert(`Biometric login ${value ? "enabled" : "disabled"}`);
    };

    await trigger2FAIfRequired(action);
  };

  const handleResetPin = async () => {
    const action = async () => {
      alert("PIN reset link sent!");
    };
    await trigger2FAIfRequired(action);
  };

  // -------------------------
  // Trigger 2FA if server requires it
  // -------------------------
  const trigger2FAIfRequired = async (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setOtpMessage("");
    setOtpValue("");
    setOtpLoading(true);

    try {
      // Ask server if 2FA is needed for the action
      const res = await api.post("/auth/check-2fa");
      const data = res.data;

      if (data.totpRequired || data.pushRequired) {
        setTotpRequired(!!data.totpRequired);
        setPushRequired(!!data.pushRequired);
        setOtpMessage("⚡ Additional 2FA required. Approve push or enter TOTP.");
      } else {
        await action();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error initiating 2FA.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------
  // Handle 2FA verification
  // -------------------------
  const handle2FAVerification = async (totpCode?: string) => {
    if (!pendingAction) return;
    setOtpLoading(true);

    try {
      const res = await api.post("/auth/verify-2fa", {
        totp: totpCode,
        push: pushRequired ? true : undefined,
      });
      const data = res.data;

      if (data.success) {
        await pendingAction();
        setPendingAction(null);
        setTotpRequired(false);
        setPushRequired(false);
        setOtpMessage("");
      } else {
        alert(data.message || "2FA verification failed.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "2FA verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const preferences = [
    { title: "Dark Mode", icon: <IoMoon size={20} />, value: isDarkMode, onChange: handleThemeSwitch },
    { title: "Enable Face ID", icon: <IoFingerPrint size={20} />, value: isFaceId, onChange: handleFaceIdToggle },
  ];

  const securityItems = [
    {
      title: "Reset Transaction PIN",
      icon: <IoLockClosed size={20} />,
      onClick: handleResetPin,
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
              disabled={otpLoading}
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
            disabled={otpLoading}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3 text-gray-800">{item.title}</span>
            </div>
            <IoChevronForward size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* OTP / 2FA Modal Section */}
      {pendingAction && (totpRequired || pushRequired) && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          {totpRequired && (
            <>
              <p className="text-sm text-gray-700 mb-1">Enter code from authenticator app</p>
              <OTPInput length={6} value={otpValue} onChange={setOtpValue} disabled={otpLoading} />
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
              <p className="text-sm text-gray-700 mt-2">A push notification has been sent. Approve to continue.</p>
              {biometricAvailable && <p className="text-sm text-gray-500">Or use device biometric (TouchID / FaceID)</p>}
              <button
                className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded"
                onClick={() => handle2FAVerification()}
                disabled={otpLoading}
              >
                {otpLoading ? "Waiting..." : "Confirm Push / Biometric"}
              </button>
            </>
          )}
          {otpMessage && <p className="text-sm text-green-600 mt-1">{otpMessage}</p>}
        </div>
      )}

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
