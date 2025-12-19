"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OTPInput from "@/components/auth/OTPInput";

interface AuthFormProps {
  mode: "login" | "register";
}

type Step = "input" | "verify" | "2fa";

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthFormProps["mode"]>(initialMode);
  const [step, setStep] = useState<Step>("input");

  /* -------------------------
     Credentials
  ------------------------- */
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  /* -------------------------
     Registration fields
  ------------------------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userID, setUserID] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  /* -------------------------
     OTP / 2FA
  ------------------------- */
  const [code, setCode] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"login" | "register">("login");

  /* -------------------------
     UI state
  ------------------------- */
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [totpRequired, setTotpRequired] = useState(false);

  /* -------------------------
     Resend timer
  ------------------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const i = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [resendTimer]);

  /* =========================================================
     START REGISTER / LOGIN
  ========================================================= */
  async function handleStart() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let endpoint = "";
      let payload: any = {};

      if (mode === "register") {
        endpoint = "/auth/register";
        payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userID: userID.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password.trim(),
        };
      } else {
        endpoint = "/auth/login";
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CONFIRM OTP (REGISTER / LOGIN)
  ========================================================= */
  async function handleConfirmOtp() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const endpoint =
        otpPurpose === "register"
          ? "/auth/confirm-registration"
          : "/auth/confirm-login";

      const { data } = await api.post(endpoint, {
        identifier: otpIdentifier,
        otp: code,
      });

      if (!data.success) {
        setError(data.message || "OTP verification failed");
        return;
      }

      // Registration success → redirect to login
      if (otpPurpose === "register") {
        setMessage("Account verified. You can now login.");
        setTimeout(() => {
          setMode("login");
          setStep("input");
          setCode("");
        }, 800);
        return;
      }

      // Login success
      finalizeLogin(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CONFIRM 2FA
  ========================================================= */
  async function handle2FAConfirm() {
    if (code.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/confirm-login", {
        identifier: otpIdentifier,
        totpCode: code,
      });

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

  /* =========================================================
     FINALIZE LOGIN
  ========================================================= */
  function finalizeLogin(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
    setMessage("Login successful. Redirecting…");
    setTimeout(() => router.push("/dashboard"), 700);
  }

  /* =========================================================
     UI
  ========================================================= */
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
            <input className="w-full p-3 border rounded-lg" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="w-full p-3 border rounded-lg" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <input className="w-full p-3 border rounded-lg" placeholder="Username" value={userID} onChange={(e) => setUserID(e.target.value)} />
          <input className="w-full p-3 border rounded-lg" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full p-3 border rounded-lg" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleStart} disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 text-white">
            {loading ? "Please wait…" : "Create Account"}
          </button>
        </>
      )}

      {/* LOGIN */}
      {mode === "login" && step === "input" && (
        <>
          <input className="w-full p-3 border rounded-lg" placeholder="Email / Phone / Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleStart} disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 text-white">
            {loading ? "Please wait…" : "Login"}
          </button>
        </>
      )}

      {/* OTP */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={code} onChange={setCode} />
          <button onClick={handleConfirmOtp} disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg">
            Verify OTP
          </button>

          {resendTimer > 0 ? (
            <p className="text-center text-sm text-gray-500">Resend in {resendTimer}s</p>
          ) : (
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={async () => {
                await api.post("/auth/resend-otp", {
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
          <button onClick={handle2FAConfirm} className="w-full py-3 bg-purple-600 text-white rounded-lg">
            Verify Code
          </button>
        </>
      )}

      {message && <p className="text-center text-sm text-green-600">{message}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
