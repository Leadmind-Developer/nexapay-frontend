"use client";

import { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import api from "@/lib/api";

type PaymentMethod = "wallet" | "paystack";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.id as string;
  const ticketTypeId = searchParams.get("ticketTypeId");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("wallet");

  const [status, setStatus] =
    useState<"idle" | "sending" | "success" | "error">("idle");

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketTypeId) {
      setErrorMessage("Ticket type not specified.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMessage(null);
    setPaymentUrl(null);
    setTicketCode(null);

    try {
      const res = await api.post("/events/checkout", {
        ticketTypeId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod,
      });

      // Wallet → ticket issued immediately
      if (paymentMethod === "wallet" && res.data.ticket) {
        setTicketCode(res.data.ticket.code);
      }

      // Paystack → redirect user
      if (paymentMethod === "paystack" && res.data.paymentUrl) {
        setPaymentUrl(res.data.paymentUrl);
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || "Checkout failed. Please try again."
      );
      setStatus("error");
    }
  };

  /* ---------------- GUARDS ---------------- */

  if (!ticketTypeId) {
    return (
      <main className="max-w-md mx-auto p-6">
        <p className="text-red-500 font-medium">
          Ticket type not specified.
        </p>
      </main>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Full name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2"
        />

        <input
          type="email"
          placeholder="Email address"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2"
        />

        <input
          placeholder="Phone number"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className="w-full rounded-xl border px-4 py-2"
        />

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value as PaymentMethod)
          }
          className="w-full rounded-xl border px-4 py-2"
        >
          <option value="wallet">Wallet</option>
          <option value="paystack">Paystack</option>
        </select>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Processing..." : "Pay"}
        </button>
      </form>

      {/* ---------------- SUCCESS ---------------- */}
      {status === "success" && (
        <div className="mt-6 space-y-3">
          {ticketCode && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <p className="text-green-700 font-medium">
                Payment successful 🎉
              </p>
              <p className="mt-1 text-sm">
                Ticket Code:
                <span className="ml-2 font-mono font-semibold">
                  {ticketCode}
                </span>
              </p>
            </div>
          )}

          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-xl bg-blue-600 text-white py-2 font-medium hover:opacity-90"
            >
              Complete Payment on Paystack →
            </a>
          )}
        </div>
      )}

      {/* ---------------- ERROR ---------------- */}
      {status === "error" && errorMessage && (
        <p className="mt-4 text-red-500">{errorMessage}</p>
      )}
    </main>
  );
}
