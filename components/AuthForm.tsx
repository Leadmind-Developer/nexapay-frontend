"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OTPInput from "@/components/OTPInput";

interface AuthFormProps {
  mode: "login" | "register";
}

type Step = "input" | "verify" | "2fa";

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthFormProps["mode"]>(initialMode);
  const [step, setStep] = useState<Step>("input");

  // Credentials
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userID, setUserID] = useState(""); // ✅ REQUIRED by backend

  // OTP / 2FA
  const [code, setCode] = useState("");

  // Backend-issued OTP context
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"login" | "register">("login");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // 2FA flags
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);

  // -------------------------
  // Resend timer
  // -------------------------
  useEffect(() => {
    if (resendTimer <= 0) return;
    const i = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [resendTimer]);

  // -------------------------
  // STEP 1: Start auth
  // -------------------------
  async function handleStartAuth() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";

      const payload =
        mode === "register"
          ? {
              name: name.trim(),
              email: identifier.trim(),
              phone: phone.trim(),
              userID: userID.trim(), // ✅ REQUIRED
              password,
            }
          : {
              identifier: identifier.trim(),
              password,
            };

      const res = await api.post(endpoint, payload, {
        headers: { "x-platform": "web" },
      });

      const data = res.data;

      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      // Store backend OTP context
      if (data.identifier) {
        setOtpIdentifier(data.identifier);
        setOtpPurpose(data.purpose);
      }

      switch (data.method) {
        case "totp":
          setTotpRequired(true);
          setPushRequired(false);
          setStep("2fa");
          break;

        case "app-biometric":
          setTotpRequired(false);
          setPushRequired(true);
          setStep("2fa");
          break;

        default:
          setStep("verify");
          setResendTimer(30);
          setMessage("OTP sent successfully");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // STEP 2: OTP confirmation
  // -------------------------
  async function handleConfirmOtp() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        mode === "register"
          ? "/auth/confirm-registration"
          : "/auth/confirm-login";

      const res = await api.post(
        endpoint,
        {
          identifier: otpIdentifier, // ✅ backend-issued identifier
          otp: code,
        },
        { headers: { "x-platform": "web" } }
      );

      const data = res.data;

      if (!data.success) {
        setError(data.message || "Invalid OTP");
        return;
      }

      switch (data.method) {
        case "totp":
          setTotpRequired(true);
          setPushRequired(false);
          setStep("2fa");
          break;

        case "app-biometric":
          setTotpRequired(false);
          setPushRequired(true);
          setStep("2fa");
          break;

        default:
          finalizeLogin(data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // STEP 3: 2FA
  // -------------------------
  async function handle2FAConfirm(totpCode?: string) {
    setLoading(true);
    setError("");
    setMessage("Verifying…");

    try {
      const res = await api.post(
        "/auth/confirm-login",
        {
          identifier: otpIdentifier,
          totpCode,
        },
        { headers: { "x-platform": "web" } }
      );

      const data = res.data;

      if (!data.success) {
        setError(data.message || "2FA verification failed");
        return;
      }

      finalizeLogin(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "2FA verification failed");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Finalize login
  // -------------------------
  function finalizeLogin(user: any) {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    setMessage("Login successful. Redirecting…");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        {mode === "register" ? "Create Account" : "Login"}
      </h1>

      {/* Mode toggle */}
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

      {/* Registration fields */}
      {mode === "register" && step === "input" && (
        <>
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
        </>
      )}

      {/* Identifier + password */}
      {step === "input" && (
        <>
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Email / Phone / UserID"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleStartAuth}
            disabled={loading || !identifier || !password}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            {loading ? "Please wait…" : mode === "register" ? "Create Account" : "Continue"}
          </button>
        </>
      )}

      {/* OTP */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button
            onClick={handleConfirmOtp}
            disabled={loading || code.length < 6}
            className="w-full py-3 rounded-lg bg-green-600 text-white"
          >
            Verify OTP
          </button>

          {resendTimer > 0 ? (
            <p className="text-center text-sm text-gray-500">
              Resend available in {resendTimer}s
            </p>
          ) : (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await api.post(
                    "/auth/resend-otp",
                    {
                      identifier: otpIdentifier,
                      purpose: otpPurpose,
                    },
                    { headers: { "x-platform": "web" } }
                  );
                  setResendTimer(30);
                  setMessage("OTP resent");
                } catch {
                  setError("Failed to resend OTP");
                } finally {
                  setLoading(false);
                }
              }}
              className="text-blue-600 text-sm hover:underline"
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
            onClick={() => handle2FAConfirm(code)}
            disabled={loading || code.length < 6}
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
