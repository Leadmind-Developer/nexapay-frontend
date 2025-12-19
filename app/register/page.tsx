"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(""); // now maps to identifier
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");

    const fName = firstName.trim();
    const lName = lastName.trim();
    const identifier = username.trim();
    const ph = phone.trim();
    const em = email.trim();
    const pw = password.trim();

    if (!fName || !lName || !identifier || !ph || !em || !pw) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        identifier,             // THIS IS REQUIRED
        name: `${fName} ${lName}`,
        phone: ph,
        email: em,
        password: pw,
      };

      const res = await AuthAPI.register(payload, {
        headers: { "x-platform": "web" },
      });

      if (res.data?.identifier) {
        router.push(`/auth/verify?i=${res.data.identifier}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      footer={
        <a href="/auth/login" className="text-blue-600">
          Already have an account? Login
        </a>
      }
    >
      <div className="flex gap-2">
        <AuthInput placeholder="First Name" value={firstName} onChange={setFirstName} />
        <AuthInput placeholder="Last Name" value={lastName} onChange={setLastName} />
      </div>

      <AuthInput placeholder="Username" value={username} onChange={setUsername} />
      <AuthInput placeholder="Phone" value={phone} onChange={setPhone} />
      <AuthInput placeholder="Email" value={email} onChange={setEmail} />
      <AuthInput type="password" placeholder="Password" value={password} onChange={setPassword} />

      <AuthSubmit onClick={handleRegister} loading={loading}>Register</AuthSubmit>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </AuthLayout>
  );
}
