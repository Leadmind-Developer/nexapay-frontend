"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api";

export default function OTPRecoveryVerify() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      router.replace("/auth/error?reason=invalid_link");
      return;
    }

    api
      .post("/auth/otp/recovery/verify", { token })
      .then(() => {
        router.replace("/auth/success?recovered=true");
      })
      .catch(() => {
        router.replace("/auth/error?reason=expired_or_invalid");
      });
  }, [token]);

  return (
    <p className="text-center mt-24 text-gray-600">
      Verifying your account…
    </p>
  );
}
