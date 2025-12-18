"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OTPInput from "@/components/OTPInput";

interface AuthFormProps {
  mode: "login" | "register";
}

type Step = "input" | "verify" | "2fa" | "forgot";

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthFormProps["mode"]>(initialMode);
  const [step, setStep] = useState<Step>("input");

  // Credentials
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userID, setUserID] = useState("");
  const [email, setEmail] = useState("");

  // OTP / 2FA
  const [code, setCode] = useState("");

  // Backend-issued OTP context
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"login" | "register" | "forgot">("login");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // 2FA flags
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);

  // -------------------------
  // Resend OTP Timer
  // -------------------------
  useEffect(() => {
    if (resendTimer <= 0) return;
    const i = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [resendTimer]);

  // -------------------------
  // START AUTH / REGISTRATION / FORGOT
  // -------------------------
  async function handleStartAuth() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let endpoint = "";
      let payload: any = {};

      if (mode === "register") {
        endpoint = "/auth/register";
        payload = { name: name.trim(), email: email.trim(), phone: phone.trim(), userID: userID.trim(), password: password.trim() };
      } else if (mode === "login") {
        endpoint = "/auth/login";
        payload = { identifier: identifier.trim(), password: password.trim() };
      } else if (mode === "forgot") {
        endpoint = "/auth/forgot-password";
        payload = { identifier: identifier.trim() };
      }

      const res = await api.post(endpoint, payload, { headers: { "x-platform": "web" } });
      const data = res.data;

      if (!data.success) {
        setError(data.message || "Action failed");
        return;
      }

      if (data.identifier) {
        setOtpIdentifier(data.identifier);
        setOtpPurpose(mode === "forgot" ? "forgot" : data.purpose);
      }

      if (data.method === "totp") {
        setTotpRequired(true);
        setPushRequired(false);
        setStep("2fa");
      } else if (data.method === "app-biometric") {
        setTotpRequired(false);
        setPushRequired(true);
        setStep("2fa");
      } else if (mode === "forgot") {
        setStep("verify");
        setResendTimer(30);
        setMessage("OTP sent to reset password");
      } else {
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
  // OTP CONFIRMATION
  // -------------------------
  async function handleConfirmOtp() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let endpoint = "";

      if (mode === "register") endpoint = "/auth/confirm-registration";
      else if (mode === "login" || step === "2fa") endpoint = "/auth/confirm-login";
      else if (mode === "forgot") endpoint = "/auth/confirm-forgot-password";

      const res = await api.post(endpoint, { identifier: otpIdentifier, otp: code }, { headers: { "x-platform": "web" } });
      const data = res.data;

      if (!data.success) {
        setError(data.message || "Invalid OTP");
        return;
      }

      if (data.method === "totp") {
        setTotpRequired(true);
        setPushRequired(false);
        setStep("2fa");
      } else if (data.method === "app-biometric") {
        setTotpRequired(false);
        setPushRequired(true);
        setStep("2fa");
      } else if (mode === "forgot") {
        setStep("input");
        setMessage("OTP verified! Set your new password below.");
        setMode("reset-password");
      } else {
        finalizeLogin(data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // 2FA CONFIRMATION
  // -------------------------
  async function handle2FAConfirm(totpCode?: string) {
    setLoading(true);
    setError("");
    setMessage("Verifying…");

    try {
      const res = await api.post("/auth/confirm-login", { identifier: otpIdentifier, totpCode }, { headers: { "x-platform": "web" } });
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
  // FINALIZE LOGIN
  // -------------------------
  function finalizeLogin(user: any) {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    setMessage("Login successful. Redirecting…");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  // -------------------------
  // UI RENDER
  // -------------------------
  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        {mode === "register" ? "Create Account" : mode === "forgot" ? "Forgot Password" : "Login"}
      </h1>

      {/* Mode toggle */}
      <p className="text-center text-sm text-gray-500">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <button className="text-blue-600 hover:underline" onClick={() => { setMode("login"); setStep("input"); }}>
              Login
            </button>
          </>
        ) : mode === "login" ? (
          <>
            Don’t have an account?{" "}
            <button className="text-blue-600 hover:underline" onClick={() => { setMode("register"); setStep("input"); }}>
              Register
            </button>{" "}
            | Forgot password?{" "}
            <button className="text-blue-600 hover:underline" onClick={() => { setMode("forgot"); setStep("input"); }}>
              Reset
            </button>
          </>
        ) : (
          <>
            Remember your password?{" "}
            <button className="text-blue-600 hover:underline" onClick={() => { setMode("login"); setStep("input"); }}>
              Login
            </button>
          </>
        )}
      </p>

      {/* Registration fields */}
      {mode === "register" && step === "input" && (
        <>
          <input className="w-full p-3 border rounded-lg" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full p-3 border rounded-lg" placeholder="Username" value={userID} onChange={(e) => setUserID(e.target.value)} />
          <input className="w-full p-3 border rounded-lg" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full p-3 border rounded-lg" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleStartAuth} disabled={loading || !name || !userID || !phone || !email || !password} className="w-full py-3 rounded-lg bg-blue-600 text-white">
            {loading ? "Please wait…" : "Create Account"}
          </button>
        </>
      )}

      {/* Login / Forgot password input */}
      {(mode === "login" || mode === "forgot" || mode === "reset-password") && step === "input" && (
        <>
          <input className="w-full p-3 border rounded-lg" placeholder="Email / Phone / Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          {(mode === "login" || mode === "reset-password") && (
            <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          <button onClick={handleStartAuth} disabled={loading || !identifier || ((mode !== "forgot") && !password)} className="w-full py-3 rounded-lg bg-blue-600 text-white">
            {loading ? "Please wait…" : mode === "login" ? "Login" : mode === "forgot" ? "Send OTP" : "Set New Password"}
          </button>
        </>
      )}

      {/* OTP Step */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button onClick={handleConfirmOtp} disabled={loading || code.length < 6} className="w-full py-3 rounded-lg bg-green-600 text-white">
            Verify OTP
          </button>
          {resendTimer > 0 ? (
            <p className="text-center text-sm text-gray-500">Resend available in {resendTimer}s</p>
          ) : (
            <button onClick={async () => {
              setLoading(true);
              try {
                await api.post("/auth/resend-otp", { identifier: otpIdentifier, purpose: otpPurpose }, { headers: { "x-platform": "web" } });
                setResendTimer(30);
                setMessage("OTP resent");
              } catch { setError("Failed to resend OTP"); } finally { setLoading(false); }
            }} className="text-blue-600 text-sm hover:underline">
              Resend OTP
            </button>
          )}
        </>
      )}

      {/* 2FA */}
      {step === "2fa" && totpRequired && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button onClick={() => handle2FAConfirm(code)} disabled={loading || code.length < 6} className="w-full py-3 bg-purple-600 text-white rounded-lg">
            Verify Code
          </button>
        </>
      )}

      {message && <p className="text-center text-sm text-green-600">{message}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
