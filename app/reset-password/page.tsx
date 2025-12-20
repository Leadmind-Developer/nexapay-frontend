"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import api from "@/lib/api";

export default function ForgotResetPasswordPage() {
  const router = useRouter();

  /* -------------------------
     Form state
  ------------------------- */
  const [step, setStep] = useState<"identifier" | "reset">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* -------------------------
     UI state
  ------------------------- */
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  /* -------------------------
     Send OTP
  ------------------------- */
  async function handleSendOtp() {
    if (!identifier.trim()) {
      setError("Please enter your email, phone, or username");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/auth/forgot", { identifier });
      if (data.success) {
        setStep("reset");
        setMessage("OTP sent! Check your email or phone.");
        setResendTimer(30);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     Reset password
  ------------------------- */
  async function handleResetPassword() {
    if (!otp || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
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
        setTimeout(() => router.push("/auth/login"), 1200);
      } else {
        setError(data.message || "Reset failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     Resend OTP timer
  ------------------------- */
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">
          {step === "identifier" ? "Forgot Password" : "Reset Password"}
        </h1>

        {step === "identifier" && (
          <>
            <AuthInput
              placeholder="Email / Phone / Username"
              value={identifier}
              onChange={setIdentifier}
            />
            <AuthSubmit onClick={handleSendOtp} loading={loading}>
              Send OTP
            </AuthSubmit>
            <div className="text-center mt-2">
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Back to login
              </a>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <AuthInput placeholder="OTP" value={otp} onChange={setOtp} />

            {/* New Password */}
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

            {/* Confirm Password */}
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

            <AuthSubmit
              onClick={handleResetPassword}
              loading={loading}
              disabled={!otp || !newPassword || !confirmPassword}
            >
              Reset Password
            </AuthSubmit>

            {/* Resend OTP */}
            {resendTimer > 0 ? (
              <p className="text-center text-sm text-gray-500">
                Resend in {resendTimer}s
              </p>
            ) : (
              <button
                className="text-sm text-blue-600 hover:underline mx-auto block"
                onClick={handleSendOtp}
              >
                Resend OTP
              </button>
            )}
          </>
        )}

        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
    </ResponsiveLandingWrapper>
  );
}
