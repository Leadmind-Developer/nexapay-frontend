"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmit from "@/components/auth/AuthSubmit";
import { AuthAPI } from "@/lib/auth/auth.api";

export default function RegisterPage() {
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userID, setUserID] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle registration
  async function handleRegister() {
    setLoading(true);
    setError("");

    // Trim all inputs
    const fName = firstName.trim();
    const lName = lastName.trim();
    const uID = userID.trim();
    const ph = phone.trim();
    const em = email.trim();
    const pw = password.trim();

    if (!fName || !lName || !uID || !ph || !em || !pw) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // Send full name as `name` for mobile handler compatibility
      const payload = {
        name: `${fName} ${lName}`,
        userID: uID,
        phone: ph,
        email: em,
        password: pw,
      };

      const res = await AuthAPI.register({
        ...payload,
        headers: { "x-platform": "web" }, // pass platform inside the same object
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
        <AuthInput
          placeholder="First Name"
          value={firstName}
          onChange={setFirstName}
        />
        <AuthInput
          placeholder="Last Name"
          value={lastName}
          onChange={setLastName}
        />
      </div>

      <AuthInput
        placeholder="Username"
        value={userID}
        onChange={setUserID}
      />
      <AuthInput
        placeholder="Phone"
        value={phone}
        onChange={setPhone}
      />
      <AuthInput
        placeholder="Email"
        value={email}
        onChange={setEmail}
      />
      <AuthInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
      />

      <AuthSubmit onClick={handleRegister} loading={loading}>
        Register
      </AuthSubmit>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </AuthLayout>
  );
}
