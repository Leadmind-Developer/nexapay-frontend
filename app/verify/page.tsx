"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthSubmit from "@/components/auth/AuthSubmit";
import OTPInput from "@/components/auth/OTPInput";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function VerifyPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // Optional: you can set this if passed via props or context
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    setLoading(true);
    setError("");
    try {
      await AuthAPI.confirmLogin({ identifier, otp: code });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Enter OTP"
      footer={<a href="/auth/login" className="text-blue-600">Back to login</a>}
    >
      <OTPInput value={code} onChange={setCode} />
      <AuthSubmit onClick={handleVerify} loading={loading}>
        Verify OTP
      </AuthSubmit>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
