"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await AuthAPI.login({ identifier, password });
      if (res.data?.method === "otp") {
        router.push(`/auth/verify?i=${res.data.identifier}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Login"
      footer={
        <>
          <a href="/auth/forgot-password" className="text-blue-600">Forgot password?</a>
          <br />
          <a href="/auth/register" className="text-blue-600">Create account</a>
        </>
      }
    >
      <AuthInput placeholder="Email / Phone / Username" value={identifier} onChange={setIdentifier} />
      <AuthInput type="password" placeholder="Password" value={password} onChange={setPassword} />
      <AuthSubmit onClick={handleLogin} loading={loading}>Login</AuthSubmit>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
