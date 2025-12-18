"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [userID, setUserID] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await AuthAPI.register({ name, userID, phone, email, password });
      if (res.data?.method === "otp") {
        router.push(`/auth/verify?i=${res.data.identifier}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout
      title="Create Account"
      footer={<a href="/auth/login" className="text-blue-600">Already have an account? Login</a>}
    >
      <AuthInput placeholder="Full Name" value={name} onChange={setName} />
      <AuthInput placeholder="Username" value={userID} onChange={setUserID} />
      <AuthInput placeholder="Phone" value={phone} onChange={setPhone} />
      <AuthInput placeholder="Email" value={email} onChange={setEmail} />
      <AuthInput type="password" placeholder="Password" value={password} onChange={setPassword} />
      <AuthSubmit onClick={handleRegister} loading={loading}>Register</AuthSubmit>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </AuthLayout>
  );
}
