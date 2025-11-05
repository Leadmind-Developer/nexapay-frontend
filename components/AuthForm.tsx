// components/AuthForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register";
}

type AuthStep = "input" | "verify" | "totp";

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  // Form state
  const [method, setMethod] = useState<"phone" | "email" | "userID">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState(""); // Only used for login/register
  const [otp, setOtp] = useState("");
  const [totpCode, setTotpCode] = useState(""); // For TOTP 2FA
  const [step, setStep] = useState<AuthStep>("input");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --------------------------
  // Step 1: Send Register or Login
  // --------------------------
  async function handleSubmit() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        const res = await api.post("/auth/register", {
          name: identifier, // you can add a separate name field if needed
          email: method === "email" ? identifier : undefined,
          phone: method === "phone" ? identifier : undefined,
          userID: method === "userID" ? identifier : undefined,
          password,
        });

        if (res.data.success) {
          setStep("verify");
          setMessage("✅ OTP sent! Please check your inbox or SMS.");
          setResendTimer(30);
        } else {
          setError(res.data.message || "Failed to send OTP.");
        }
      } else {
        // Login
        const res = await api.post("/auth/login", {
          identifier,
          password,
        });

        if (res.data.success) {
          if (res.data.method === "otp") {
            setStep("verify");
            setMessage("✅ OTP sent! Please check your inbox or SMS.");
            setResendTimer(30);
          } else if (res.data.method === "totp" || res.data.method === "app-biometric") {
            setStep("totp");
            setMessage(res.data.message || "Enter your 2FA code.");
          }
        } else {
          setError(res.data.message || "Login failed.");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // Step 2: Verify OTP
  // --------------------------
  async function handleVerifyOtp() {
    if (!otp) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/confirm-registration" : "/auth/confirm-login";

      const payload: Record<string, string> = { identifier, token: otp };
      if (totpCode) payload.totpCode = totpCode;

      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        setMessage("🎉 Verification successful! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setError(res.data.message || "Invalid OTP/2FA code.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP/2FA.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // Resend OTP
  // --------------------------
  async function handleResend() {
    if (loading) return;
    setResendTimer(30);
    handleSubmit();
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        {mode === "register" ? "Create Account" : "Login"}
      </h1>

      {/* Method selection */}
      <div className="flex justify-center gap-2">
        {["phone", "email", "userID"].map((type) => (
          <button
            key={type}
            onClick={() => setMethod(type as "phone" | "email" | "userID")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              method === type
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Input / OTP / TOTP steps */}
      {step === "input" && (
        <>
          {mode === "register" && (
            <input
              type={method === "email" ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={method === "email" ? "Enter email" : "Enter identifier"}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )}

          {mode === "login" && (
            <>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email, Phone, or UserID"
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !identifier || (mode === "login" && !password)}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              loading || !identifier || (mode === "login" && !password)
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : mode === "register" ? "Register" : "Login"}
          </button>
        </>
      )}

      {step === "verify" && (
        <>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={!otp || loading}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              !otp || loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {resendTimer > 0 ? (
            <p className="text-center text-sm text-gray-500 mt-2">
              Resend available in {resendTimer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2"
            >
              Resend OTP
            </button>
          )}
        </>
      )}

      {step === "totp" && (
        <>
          <input
            type="text"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            placeholder="Enter 2FA code"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={!totpCode || loading}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              !totpCode || loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify 2FA"}
          </button>
        </>
      )}

      {/* Messages */}
      {message && <p className="text-center text-sm text-green-600 dark:text-green-400">{message}</p>}
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
