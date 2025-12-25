// hooks/useCheckout.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Stage = "idle" | "processing" | "success" | "error";

type CheckoutOptions = {
  endpoint: string;
  payload: Record<string, any>;
  redirectTo?: string;
  withCredentials?: boolean;
};

export function useCheckout() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  /* ------------------ auto redirect on success ------------------ */
  useEffect(() => {
    if (stage !== "success") return;

    const t = setTimeout(() => {
      router.push("/transactions");
    }, 3000);

    return () => clearTimeout(t);
  }, [stage, router]);

  /* ------------------ helpers ------------------ */
  const extractReference = (data: any) =>
    data?.requestId ||
    data?.reference ||
    data?.vtpass?.requestId ||
    data?.vtpass?.vtpassTransaction?.request_id ||
    data?.vtpassTransaction?.request_id ||
    null;

  /* ------------------ checkout ------------------ */
  const checkout = async ({
    endpoint,
    payload,
    redirectTo,
    withCredentials = true,
  }: CheckoutOptions) => {
    try {
      setStage("processing");
      setErrorMessage("");

      const res = await api.post(endpoint, payload, {
        withCredentials,
      });

      // ✅ WALLET / VTpass SUCCESS
      if (res.data?.success === true) {
        setReference(extractReference(res.data));
        setResponseData(res.data);
        setStage("success");
        return;
      }

      // 💳 PAYSTACK FALLBACK
      if (res.data?.status === "paystack" && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      // ❌ BACKEND ERROR
      setErrorMessage(
        res.data?.message ||
        "Unable to complete this transaction. Please check your transaction history."
      );
      setStage("error");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(
        err?.response?.data?.message ||
        "Something went wrong. Please check your transaction history."
      );
      setStage("error");
    }
  };

  return {
    stage,
    errorMessage,
    reference,
    responseData,
    checkout,
    reset: () => {
      setStage("idle");
      setErrorMessage("");
      setReference(null);
      setResponseData(null);
    },
  };
}
