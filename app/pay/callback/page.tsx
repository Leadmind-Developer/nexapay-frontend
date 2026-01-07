"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type Status = "loading" | "success" | "error";

export default function PayCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your payment…");

  useEffect(() => {
    const reference =
      searchParams.get("reference") ||
      searchParams.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    async function verifyPayment() {
      try {
        const res = await api.get(`/paystack/verify/${reference}`);

        const tx = res.data;

        if (tx.status !== "success") {
          throw new Error("Payment not successful");
        }

        setStatus("success");
        setMessage("Payment successful 🎉 Redirecting…");

        /**
         * 🔀 Route based on metadata / purpose
         */
        const metadata = tx.metadata || {};

        setTimeout(() => {
          // Event tickets
          if (metadata.type === "event" || metadata.purpose?.includes("ticket")) {
            router.push(`/pay/success?reference=${reference}`);
            return;
          }

          // Savings / Loan / Fund
          if (metadata.type) {
            router.push(`/wallet/transactions?ref=${reference}`);
            return;
          }

          // Fallback
          router.push("/");
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            err.message ||
            "Payment verification failed. Please contact support."
        );
      }
    }

    verifyPayment();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Spinner />
            <h1 className="text-xl font-semibold mt-4">
              Processing Payment
            </h1>
            <p className="text-gray-500 mt-2">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <SuccessIcon />
            <h1 className="text-2xl font-bold mt-4 text-green-600">
              Payment Successful
            </h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon />
            <h1 className="text-2xl font-bold mt-4 text-red-600">
              Payment Failed
            </h1>
            <p className="text-gray-600 mt-2">{message}</p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-block rounded-xl bg-black text-white px-6 py-3 hover:opacity-90"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </main>
  );
}

/* ================= UI HELPERS ================= */

function Spinner() {
  return (
    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
      <span className="text-green-600 text-3xl">✓</span>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
      <span className="text-red-600 text-3xl">✕</span>
    </div>
  );
}
