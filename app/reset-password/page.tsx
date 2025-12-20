"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  /* =========================================================
     REQUEST RESET OTP
  ========================================================= */
  async function handleRequestOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/auth/forgot", { identifier });

      if (data.success) {
        setOtpSent(true);
        setMessage("OTP sent! Check your email or phone.");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RESET PASSWORD
  ========================================================= */
  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/auth/reset", {
        identifier,
        otp,
        newPassword,
      });

      if (data.success) {
        setMessage("Password reset successfully. Redirecting to login…");
        setTimeout(() => router.push("/auth/login"), 1000);
      } else {
        setError(data.message || "Reset failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Reset Password</h1>

        {/* Identifier (email/phone/username) */}
        {!otpSent && (
          <>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Email / Phone / Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <button
              onClick={handleRequestOtp}
              disabled={loading || !identifier.trim()}
              className="w-full py-3 rounded-lg bg-blue-600 text-white"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </>
        )}

        {/* OTP + New Password */}
        {otpSent && (
          <>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border rounded-lg"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-3 border rounded-lg"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || !otp || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-lg bg-green-600 text-white"
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </>
        )}

        <div className="text-center mt-2">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Back to login
          </a>
        </div>

        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
    </ResponsiveLandingWrapper>
  );
}
