"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function OTPPage() {
  const params = useSearchParams();
  const phone = params?.get("phone") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function verify() {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth", { phone, otp }); // proxies to real backend /auth/verify-otp
      // server sets cookie; client can also store token secondary
      if (res.data?.token) {
        // optionally store UI token (not required if cookie used)
        localStorage.setItem("nexa_token", res.data.token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Enter OTP for {phone}</h2>
      <input className="w-full p-2 border rounded mb-3" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button className="btn" onClick={verify} disabled={!otp || loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}
