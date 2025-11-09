// components/AuthForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OTPInput from "@/otp/OTPClient";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [method, setMethod] = useState<"phone" | "email" | "userID">("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "verify" | "2fa">("input");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const router = useRouter();

  // --------------------------
  // Detect WebAuthn / biometrics support
  // --------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Check if WebAuthn is available in browser
    if (window.PublicKeyCredential) setBiometricAvailable(true);
  }, []);

  // -------------------
  // Resend timer countdown
  // -------------------
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --------------------------
  // STEP 1: Send OTP / Start login
  // --------------------------
  async function handleSendOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";

      const body =
        method === "phone"
          ? { identifier: identifier.trim(), method: "phone" }
          : method === "email"
          ? { identifier: identifier.trim(), method: "email" }
          : { identifier: identifier.trim(), method: "userID" };

      const res = await api.post(endpoint, body);
      const data = res.data;

      if (data.success) {
        if (data.totpRequired || data.pushRequired) {
          setTotpRequired(!!data.totpRequired);
          setPushRequired(!!data.pushRequired);
          setStep("2fa");
          setMessage("⚡ Additional 2FA required. Please complete verification.");
        } else {
          setStep("verify");
          setMessage("✅ OTP sent successfully! Check your inbox or SMS.");
          setResendTimer(30);
        }
      } else setError(data.message || "Failed to send OTP.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // STEP 2: Verify OTP / 2FA
  // --------------------------
  async function handleVerifyOtp() {
    if (otp.length < 6) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        mode === "register" ? "/auth/confirm-registration" : "/auth/confirm-login";

      const body =
        method === "phone"
          ? { identifier: identifier.trim(), token: otp }
          : method === "email"
          ? { identifier: identifier.trim(), token: otp }
          : { identifier: identifier.trim(), token: otp };

      const res = await api.post(endpoint, body);
      const data = res.data;

      if (data.success) {
        if (data.totpRequired || data.pushRequired) {
          setTotpRequired(!!data.totpRequired);
          setPushRequired(!!data.pushRequired);
          setStep("2fa");
          setMessage("⚡ Additional 2FA required. Please complete verification.");

          // Auto trigger biometric prompt if available
          if (biometricAvailable && data.webauthnChallenge) {
            await handleBiometricLogin(data.webauthnChallenge);
          }
        } else {
          finalizeLogin(data.token, data.user);
        }
      } else setError(data.message || "Invalid OTP. Please try again.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // Biometric / WebAuthn login
  // --------------------------
  async function handleBiometricLogin(challenge: any) {
    try {
      const credential = await navigator.credentials.get({
        publicKey: challenge,
      }) as PublicKeyCredential;

      const authData = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(
            (credential.response as AuthenticatorAssertionResponse).clientDataJSON
          ))),
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(
            (credential.response as AuthenticatorAssertionResponse).authenticatorData
          ))),
          signature: btoa(String.fromCharCode(...new Uint8Array(
            (credential.response as AuthenticatorAssertionResponse).signature
          ))),
          userHandle: credential.response?.userHandle
            ? btoa(String.fromCharCode(...new Uint8Array(
                credential.response.userHandle
              )))
            : null,
        },
      };

      // Send to server for verification
      const res = await api.post("/auth/verify-webauthn", {
        identifier,
        credential: authData,
      });

      if (res.data.success && res.data.token) {
        finalizeLogin(res.data.token, res.data.user);
      } else {
        setError(res.data.message || "Biometric verification failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Biometric authentication failed or was cancelled.");
    }
  }

  // --------------------------
  // STEP 3: TOTP / Push 2FA
  // --------------------------
  async function handle2FAVerification(totpCode?: string) {
    setLoading(true);
    setError("");
    setMessage("Verifying 2FA...");

    try {
      const res = await api.post("/auth/verify-2fa", {
        identifier,
        totp: totpCode,
        push: pushRequired ? true : undefined,
      });

      const data = res.data;

      if (data.success && data.token) {
        finalizeLogin(data.token, data.user);
      } else {
        setError(data.message || "2FA verification failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "2FA verification failed.");
    } finally {
      setLoading(false);
    }
  }

  function finalizeLogin(token: string, user: any) {
    localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const isProd = process.env.NODE_ENV === "production";
    document.cookie = `nexa_token=${token}; path=/; max-age=604800; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`;

    setMessage("🎉 Login successful! Redirecting...");
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        {mode === "register" ? "Create Account" : "Login"}
      </h1>

      <div className="flex justify-center gap-2">
        {["phone", "email", "userID"].map((type) => (
          <button
            key={type}
            onClick={() => setMethod(type as "phone" | "email" | "userID")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              method === type
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {type === "phone" ? "Phone" : type === "email" ? "Email" : "UserID"}
          </button>
        ))}
      </div>

      {/* STEP INPUT */}
      {step === "input" && (
        <>
          <input
            type={method === "phone" ? "tel" : method === "email" ? "email" : "text"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              method === "phone"
                ? "Enter phone number"
                : method === "email"
                ? "Enter email address"
                : "Enter userID"
            }
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading || !identifier.trim()}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              loading || !identifier.trim()
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {/* STEP OTP VERIFY */}
      {step === "verify" && (
        <>
          <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              loading || otp.length < 6
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-3">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {/* STEP 2FA */}
      {step === "2fa" && (
        <>
          {totpRequired && (
            <>
              <p className="text-center text-sm mb-2 text-gray-700 dark:text-gray-300">
                Enter code from your authenticator app
              </p>
              <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
              <button
                onClick={() => handle2FAVerification(otp)}
                disabled={otp.length < 6 || loading}
                className={`w-full py-3 mt-2 rounded-lg text-white font-medium ${
                  otp.length < 6 || loading
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {loading ? "Verifying..." : "Verify TOTP"}
              </button>
            </>
          )}

          {pushRequired && (
            <>
              <p className="text-center text-sm mt-4 text-gray-700 dark:text-gray-300">
                A push notification has been sent to your device. Approve to continue.
              </p>
              {biometricAvailable && (
                <p className="text-center text-sm mt-1 text-gray-500">
                  You can also use your device biometric (TouchID / FaceID)
                </p>
              )}
              <button
                onClick={() => handle2FAVerification()}
                disabled={loading}
                className="w-full py-3 mt-2 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Waiting..." : "Confirm Push / Biometric"}
              </button>
            </>
          )}
        </>
      )}

      {/* Messages / Errors */}
      {message && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">{message}</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
