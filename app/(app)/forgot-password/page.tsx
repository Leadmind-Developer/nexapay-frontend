"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "@/components/AuthPage";
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
      await AuthAPI.forgot({
        identifier: identifier.trim().toLowerCase(),
      });

      setMessage("OTP sent. Check your email or phone.");

      setTimeout(() => {
        router.push(`/reset-password?i=${identifier}`);
      }, 800);

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Request failed"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <AuthPage
      videoSrc="/videos/login-bg.mp4"
      imageSrc="/images/login-bg.jpg"
    >

      <div className="
        max-w-md 
        mx-auto 
        bg-white 
        dark:bg-gray-800
        rounded-2xl 
        shadow 
        p-6 
        space-y-6
      ">

        <h1 className="text-2xl font-semibold text-center">
          Forgot Password
        </h1>


        <p className="text-center text-sm text-gray-500">
          Enter your email, phone or username and we will send you a reset OTP.
        </p>


        <input
          className="
            w-full
            p-3
            border
            rounded-lg
            dark:bg-gray-700
          "
          placeholder="Email / Phone / Username"
          value={identifier}
          onChange={(e) =>
            setIdentifier(
              e.target.value.toLowerCase().replace(/\s/g, "")
            )
          }
        />


        <button
          onClick={handleForgot}
          disabled={loading || !identifier}
          className="
            w-full
            py-3
            rounded-lg
            bg-blue-600
            text-white
            disabled:opacity-50
          "
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>


        <div className="text-center text-sm">

          <a
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Back to login
          </a>

        </div>


        {message && (
          <p className="text-center text-sm text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

      </div>

    </AuthPage>
  );
}
