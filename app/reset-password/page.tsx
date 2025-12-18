"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("i") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await AuthAPI.reset({ token: otp, newPassword });
      setMessage("Password reset successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      footer={<a href="/auth/login" className="text-blue-600">Back to login</a>}
    >
      <AuthInput placeholder="OTP" value={otp} onChange={setOtp} />
      <AuthInput
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={setNewPassword}
      />
      <AuthSubmit onClick={handleReset} loading={loading}>
        Reset Password
      </AuthSubmit>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
