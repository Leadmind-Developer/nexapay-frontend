"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OTPInput from "@/components/auth/OTPInput";
import api from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register";
}

type Step = "input" | "verify" | "2fa";

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthFormProps["mode"]>(initialMode);
  const [step, setStep] = useState<Step>("input");

  // -------------------------
  // Credentials
  // -------------------------
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------
  // Registration fields
  // -------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userID, setUserID] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // -------------------------
  // OTP / 2FA
  // -------------------------
  const [code, setCode] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"login" | "register">("login");
  const [totpRequired, setTotpRequired] = useState(false);

  // -------------------------
  // UI state
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // -------------------------
  // Resend OTP timer
  // -------------------------
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // -------------------------
  // Start login/register
  // -------------------------
  async function handleStart() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let endpoint = "";
      let payload: any = {};

      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        endpoint = "/auth/web/register";
        payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userID: userID.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password.trim(),
        };
      } else {
        endpoint = "/auth/web/login";
        payload = {
          identifier: identifier.trim(),
          password: password.trim(),
        };
      }

      const { data } = await api.post(endpoint, payload);

      if (!data.success) {
        setError(data.message || "Action failed");
        return;
      }

      // OTP required
      if (data.identifier) {
        setOtpIdentifier(data.identifier);
        setOtpPurpose(data.purpose || mode);
        setStep("verify");
        setResendTimer(30);
        setMessage("OTP sent");
        return;
      }

      // 2FA required
      if (data.method === "totp") {
        setTotpRequired(true);
        setStep("2fa");
        return;
      }

      // ✅ LOGIN SUCCESS → NAVIGATE IMMEDIATELY
      if (mode === "login") {
        setMessage("Login successful. Redirecting…");
        router.push("/coming-soon");
        return;
      }

      // REGISTER SUCCESS
      setMessage("Registration successful. Please login.");
      setMode("login");
      setStep("input");
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // OTP confirm
  // -------------------------
  async function handleConfirmOtp() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const endpoint =
        otpPurpose === "register"
          ? "/auth/web/register/confirm"
          : "/auth/web/login/confirm";

      const { data } = await api.post(endpoint, {
        identifier: otpIdentifier,
        otp: code,
      });

      if (!data.success) {
        setError(data.message || "OTP verification failed");
        return;
      }

      if (otpPurpose === "register") {
        setMessage("Account verified. You can now login.");
        setMode("login");
        setStep("input");
        setCode("");
        return;
      }

      setMessage("Login successful. Redirecting…");
      router.push("/coming-soon");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // 2FA confirm
  // -------------------------
  async function handle2FAConfirm() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/web/confirm-login", {
        identifier: otpIdentifier,
        totpCode: code,
      });

      if (!data.success) {
        setError(data.message || "2FA verification failed");
        return;
      }

      setMessage("Login successful. Redirecting…");
      router.push("/coming-soon");
    } catch (err: any) {
      setError(err.response?.data?.message || "2FA verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        {mode === "register" ? "Create Account" : "Login"}
      </h1>

      {/* Toggle */}
      <p className="text-center text-sm text-gray-500">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                setMode("login");
                setStep("input");
              }}
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                setMode("register");
                setStep("input");
              }}
            >
              Register
            </button>
          </>
        )}
      </p>

      {/* LOGIN / REGISTER / OTP / 2FA UI */}
      {/* (unchanged from your original – omitted here for brevity) */}

      {message && <p className="text-center text-sm text-green-600">{message}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
