"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register";
}

type Step = "input" | "verify" | "2fa";

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();
  const { login: verifyLogin } = useAuth();

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
          setLoading(false);
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

      // Login/register success with HttpOnly cookie
      if (mode === "login") {
        setMessage("Login successful. Redirecting…");
        await verifyLogin(); // ✅ cookie-based login
        setTimeout(() => router.push("/dashboard"), 700);
      } else {
        setMessage("Registration successful. Please login.");
        setTimeout(() => {
          setMode("login");
          setStep("input");
        }, 700);
      }
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
        setTimeout(() => {
          setMode("login");
          setStep("input");
          setCode("");
        }, 800);
        return;
      }

      setMessage("Login successful. Redirecting…");
  
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
      await verifyLogin(); // ✅ cookie-based login
      setTimeout(() => router.push("/coming-soon"), 700);
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

      {/* REGISTER */}
      {mode === "register" && step === "input" && (
        <>
          <div className="flex gap-2">
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Username"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            {loading ? "Please wait…" : "Create Account"}
          </button>
        </>
      )}

      {/* LOGIN */}
      {mode === "login" && step === "input" && (
        <>
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Email / Phone / Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            {loading ? "Please wait…" : "Login"}
          </button>

          <div className="text-center mt-2">
            <a
              href="/reset-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </>
      )}

      {/* OTP */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button
            onClick={handleConfirmOtp}
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg"
          >
            Verify OTP
          </button>

          {resendTimer > 0 ? (
            <p className="text-center text-sm text-gray-500">
              Resend in {resendTimer}s
            </p>
          ) : (
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={async () => {
                await api.post("/auth/web/resend-otp", {
                  identifier: otpIdentifier,
                  purpose: otpPurpose,
                });
                setResendTimer(30);
              }}
            >
              Resend OTP
            </button>
          )}
        </>
      )}

      {/* 2FA */}
      {step === "2fa" && totpRequired && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button
            onClick={handle2FAConfirm}
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg"
          >
            Verify Code
          </button>
        </>
      )}

      {message && <p className="text-center text-sm text-green-600">{message}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
