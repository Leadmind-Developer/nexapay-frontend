"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import OTPInput from "@/components/auth/OTPInput";

export default function AuthenticatorSetupPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.post("/auth/2fa/totp/setup").then((res) => {
      setQr(res.data.qrCode);
      setSecret(res.data.secret);
    });
  }, []);

  const confirm = async () => {
    setLoading(true);
    try {
      await api.post("/auth/2fa/totp/verify", { code: otp });
      alert("Authenticator enabled");
      location.href = "/dashboard/settings";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold mb-2">
        Set up authenticator
      </h1>

      {qr && (
        <img src={qr} alt="QR code" className="mx-auto my-4" />
      )}

      {secret && (
        <p className="text-xs text-zinc-500 mb-3">
          Manual key: <span className="font-mono">{secret}</span>
        </p>
      )}

      <OTPInput length={6} value={otp} onChange={setOtp} />

      <button
        onClick={confirm}
        disabled={otp.length < 6 || loading}
        className="mt-4 w-full bg-indigo-600 text-white rounded-lg py-2"
      >
        {loading ? "Verifying…" : "Confirm"}
      </button>
    </div>
  );
}
