"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function OTPClient() {
  const params = useSearchParams();
  const phone = params?.get("phone") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function verify() {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth", { phone, otp });
      if (res.data?.token) localStorage.setItem("nexa_token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Verify OTP
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
          Enter the one-time password sent to <span className="font-medium">{phone}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          className="w-full p-3 mb-4 text-center text-lg font-mono border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={verify}
          disabled={!otp || loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Didn’t receive the OTP?{" "}
          <button
            className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
            onClick={() => alert("Resend OTP feature coming soon")}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
