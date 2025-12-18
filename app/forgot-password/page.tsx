"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleForgot() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await AuthAPI.forgot({ identifier });
      setMessage("OTP sent! Check your email or phone.");
      router.push(`/auth/reset-password?i=${identifier}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Request failed");
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      footer={<a href="/auth/login" className="text-blue-600">Back to login</a>}
    >
      <AuthInput placeholder="Email / Phone / Username" value={identifier} onChange={setIdentifier} />
      <AuthSubmit onClick={handleForgot} loading={loading}>Send OTP</AuthSubmit>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
