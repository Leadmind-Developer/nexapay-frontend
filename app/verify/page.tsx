"use client";

import { useState, useSearchParams } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthSubmit from "@/components/auth/AuthSubmit";
import OTPInput from "@/components/auth/OTPInput";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const identifier = searchParams.get("i") || "";

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
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout
      title="Enter OTP"
      footer={<a href="/auth/login" className="text-blue-600">Back to login</a>}
    >
      <OTPInput value={code} onChange={setCode} />
      <AuthSubmit onClick={handleVerify} loading={loading}>Verify OTP</AuthSubmit>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
