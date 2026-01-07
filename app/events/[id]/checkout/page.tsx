"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import api from "@/lib/api";

type PaymentMethod = "wallet" | "paystack";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.id as string;
  const ticketTypeIdParam = searchParams.get("ticketTypeId");
  const referenceParam = searchParams.get("reference");

  const [ticketTypeId, setTicketTypeId] = useState(ticketTypeIdParam);
  const [reference, setReference] = useState(referenceParam);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("wallet");

  const [status, setStatus] =
    useState<"idle" | "sending" | "success" | "error">("idle");
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- FETCH EXISTING ORDER ---------------- */
  useEffect(() => {
    if (reference) {
      setStatus("sending");
      api.get(`/events/orders/${reference}`)
        .then(res => {
          if (res.data.ticket) {
            setTicketCode(res.data.ticket.code);
            setStatus("success");
          } else {
            setStatus("idle");
          }
        })
        .catch(err => {
          console.error(err);
          setStatus("idle");
        });
    }
  }, [reference]);

  /* ---------------- SUBMIT NEW ORDER ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketTypeId) {
      setErrorMessage("Ticket type not specified.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMessage(null);
    setTicketCode(null);
    setPaymentUrl(null);

    try {
      const res = await api.post("/events/checkout", {
        ticketTypeId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod,
      });

      const data = res.data;
      setReference(data.reference);

      // Wallet → ticket issued immediately
      if (paymentMethod === "wallet" && data.ticket) {
        setTicketCode(data.ticket.code);
        setStatus("success");
      }

      // Paystack → redirect user
      if (paymentMethod === "paystack" && data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        window.location.href = data.paymentUrl;
        return;
      }

      // Default success
      if (!ticketCode) setStatus("success");
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
      {status === "success" && ticketCode && (
        <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4">
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

      {/* ---------------- PAYSTACK REDIRECT ---------------- */}
      {paymentUrl && (
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center rounded-xl bg-blue-600 text-white py-2 font-medium hover:opacity-90"
        >
          Complete Payment on Paystack →
        </a>
      )}

      {/* ---------------- ERROR ---------------- */}
      {status === "error" && errorMessage && (
        <p className="mt-4 text-red-500">{errorMessage}</p>
      )}
    </main>
  );
}
