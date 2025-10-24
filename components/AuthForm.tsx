"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [method, setMethod] = useState<"phone" | "email" | "userID">("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0); // seconds left before resend allowed
  const router = useRouter();

  // 🪄 Ensure token persists in axios after reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // countdown for resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --------------------------
  // STEP 1: Send OTP
  // --------------------------
  async function handleSendOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const body =
        method === "phone"
          ? { phone: identifier }
          : method === "email"
          ? { email: identifier }
          : { userID: identifier };

      const res = await api.post(endpoint, body);

      if (res.data.sent || res.data.success) {
        setStep("verify");
        setMessage("✅ OTP sent successfully! Check your inbox or SMS.");
        setResendTimer(30); // start 30s cooldown
      } else {
        setError(res.data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 429) {
        setError("⚠️ Too many OTP requests. Please try again in an hour.");
      } else {
        setError(err.response?.data?.message || "Error sending OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // STEP 2: Verify OTP
  // --------------------------
  async function handleVerifyOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        mode === "register"
          ? "/auth/verify-register-otp"
          : "/auth/verify-otp";

      const body =
        method === "phone"
          ? { phone: identifier, otp }
          : method === "email"
          ? { email: identifier, otp }
          : { userID: identifier, otp };

      const res = await api.post(endpoint, body);
      const data = res.data;

      // ✅ Ensure success flag is true before trusting token
      if (data?.success && data?.token) {
        const token = data.token;
        const user = data.user || null;

        // Persist token and user
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        // Apply token for future API calls
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // ✅ NEW — set cookie so middleware recognizes login + Use secure cookies only in production
        const isProd = process.env.NODE_ENV === "production";
        document.cookie = `nexa_token=${token}; path=/; max-age=604800; SameSite=Lax${
          isProd ? "; Secure" : ""
          }`;

        setMessage("🎉 Verification successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        setError(data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 429) {
        setError("⚠️ Too many attempts. Please wait and try again later.");
      } else {
        setError(err.response?.data?.message || "Invalid or expired OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        {mode === "register" ? "Create Account" : "Login"}
      </h1>

      {/* Toggle between phone/email/userID */}
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
            {type === "phone"
              ? "Phone"
              : type === "email"
              ? "Email"
              : "UserID"}
          </button>
        ))}
      </div>

      {/* Input / Verify Steps */}
      {step === "input" ? (
        <>
          <input
            type={
              method === "phone"
                ? "tel"
                : method === "email"
                ? "email"
                : "text"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              method === "phone"
                ? "Enter phone number"
                : method === "email"
                ? "Enter email address"
                : "Enter userID"
            }
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading || !identifier}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              loading || !identifier
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 4}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              loading || otp.length < 4
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend OTP */}
          <div className="text-center mt-3">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {/* Message / Error */}
      {message && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
