
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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userID, setUserID] = useState("");

  // OTP / TOTP
  const [code, setCode] = useState("");

  // State
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
  // Validation helpers
  // -------------------------
  function validateInput(): boolean {
    if (!identifier || !password) {
      setError("Identifier and password are required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (mode === "register") {
      if (!name || !userID) {
        setError("All registration fields are required");
        return false;
      }
    }

    return true;
  }

  // -------------------------
  // STEP 1: Start auth
  // -------------------------
  async function handleStartAuth() {
    if (!validateInput()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";

      const payload =
        mode === "register"
          ? {
              name: name.trim(),
              email: identifier.trim().toLowerCase(),
              phone: phone.trim() || undefined,
              userID: userID.trim().toLowerCase(),
              password,
            }
          : {
              identifier: identifier.trim(),
              password,
            };

      const { data } = await api.post(endpoint, payload);

      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      // Canonical identifier (important for OTP verify)
      if (data.identifier) {
        setIdentifier(data.identifier);
      }

      // 2FA first
      if (data.method === "totp" || data.method === "app-biometric") {
        setTotpRequired(data.method === "totp");
        setPushRequired(data.method === "app-biometric");
        setStep("2fa");
        setMessage("Additional verification required");
        return;
      }

      // OTP flow
      setStep("verify");
      setResendTimer(30);
      setMessage("OTP sent successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // STEP 2: Confirm OTP
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

      const { data } = await api.post(endpoint, {
        identifier: identifier.trim(),
        otp: code,
      });

      if (!data.success) {
        setError(data.message || "Invalid OTP");
        return;
      }

      if (data.method === "totp" || data.method === "app-biometric") {
        setTotpRequired(data.method === "totp");
        setPushRequired(data.method === "app-biometric");
        setStep("2fa");
        return;
      }

      finalizeAuth();
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
    setMessage("Verifying...");

    try {
      const endpoint =
        mode === "register"
          ? "/auth/confirm-registration"
          : "/auth/confirm-login";

      const { data } = await api.post(endpoint, {
        identifier: identifier.trim(),
        totpCode,
      });

      if (!data.success) {
        setError(data.message || "2FA verification failed");
        return;
      }

      finalizeAuth();
    } catch (err: any) {
      setError(err.response?.data?.message || "2FA verification failed");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // STEP 2b: Resend OTP (DEDICATED)
  // -------------------------
  async function handleResendOtp() {
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/resend-otp", {
        identifier: identifier.trim(),
        purpose: mode === "register" ? "register" : "login",
      });

      setResendTimer(30);
      setMessage("OTP resent successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Finalize auth (cookie-based)
  // -------------------------
  function finalizeAuth() {
    setMessage("Authentication successful. Redirecting…");
    setTimeout(() => router.push("/dashboard"), 700);
  }

  // -------------------------
  // UI
  // -------------------------
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
            <button onClick={() => { setMode("login"); setStep("input"); }}>
              Login
            </button>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <button onClick={() => { setMode("register"); setStep("input"); }}>
              Register
            </button>
          </>
        )}
      </p>

      {/* Registration fields */}
      {mode === "register" && step === "input" && (
        <>
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="Username / UserID" value={userID} onChange={(e) => setUserID(e.target.value)} />
        </>
      )}

      {/* Credentials */}
      {step === "input" && (
        <>
          <input placeholder="Email / Phone / UserID" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleStartAuth} disabled={loading}>
            {loading ? "Please wait…" : mode === "register" ? "Create Account" : "Continue"}
          </button>
        </>
      )}

      {/* OTP */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button onClick={handleConfirmOtp} disabled={loading || code.length < 6}>
            Verify OTP
          </button>

          {resendTimer > 0 ? (
            <p>Resend in {resendTimer}s</p>
          ) : (
            <button onClick={handleResendOtp}>Resend OTP</button>
          )}
        </>
      )}

      {/* 2FA */}
      {step === "2fa" && (
        <>
          {totpRequired && (
            <>
              <OTPInput length={6} value={code} onChange={setCode} />
              <button onClick={() => handle2FAConfirm(code)}>Verify Code</button>
            </>
          )}

          {pushRequired && (
            <button onClick={() => handle2FAConfirm()}>
              I’ve approved on my device
            </button>
          )}
        </>
      )}

      {message && <p className="text-green-600 text-sm text-center">{message}</p>}
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
    </div>
  );
}
