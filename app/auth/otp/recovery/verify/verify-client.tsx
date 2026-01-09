"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OTPRecoveryVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  useEffect(() => {
    if (!token) {
      router.replace("/auth/error?reason=invalid_link");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        await api.post("/auth/otp/recovery/verify", { token });

        if (cancelled) return;

        setStatus("success");

        setTimeout(() => {
          router.replace("/auth/success?recovered=true");
        }, 400);
      } catch {
        if (cancelled) return;

        setStatus("error");

        setTimeout(() => {
          router.replace("/auth/error?reason=expired_or_invalid");
        }, 500);
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-3">
        {status === "verifying" && (
          <>
            <div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full rounded-full" />
            <p className="text-gray-600 dark:text-gray-300">
              Verifying your account…
            </p>
          </>
        )}

        {status === "success" && (
          <p className="text-green-600 font-medium">
            Verification successful. Redirecting…
          </p>
        )}

        {status === "error" && (
          <p className="text-red-600 font-medium">
            Verification failed. Redirecting…
          </p>
        )}
      </div>
    </div>
  );
}
