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

  /* ------------------ auto redirect ------------------ */
  useEffect(() => {
    if (stage !== "success") return;

    const t = setTimeout(() => {
      router.push("/transactions");
    }, 2500);

    return () => clearTimeout(t);
  }, [stage, router]);

  /* ------------------ helpers ------------------ */
  const extractReference = (data: any): string | null => {
    return (
      data?.requestId ||
      data?.reference ||
      data?.vtpassTransaction?.requestId ||
      data?.vtpass?.vtpassTransaction?.requestId ||
      data?.vtpass?.requestId ||
      null
    );
  };

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

      /* ✅ WALLET / DIRECT SUCCESS */
      if (res.data?.success === true) {
        const ref = extractReference(res.data);
        setReference(ref);
        setResponseData(res.data);
        setStage("success");
        return;
      }

      /* 💳 PAYSTACK REDIRECT */
      if (
        res.data?.status === "paystack" &&
        res.data?.authorization_url
      ) {
        window.location.href = res.data.authorization_url;
        return;
      }

      /* ❌ BACKEND ERROR */
      setErrorMessage(
        res.data?.error ||
        res.data?.message ||
        "Transaction failed. Please check your history."
      );
      setStage("error");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unexpected error occurred."
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
    reset() {
      setStage("idle");
      setErrorMessage("");
      setReference(null);
      setResponseData(null);
    },
  };
}
