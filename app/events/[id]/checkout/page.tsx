"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

type PaymentMethod = "wallet" | "paystack";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const ticketTypeId = searchParams.get("ticketTypeId");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [status, setStatus] = useState<"sending" | "success" | "error" | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTypeId) return;

    setStatus("sending");
    setErrorMessage(null);
    setPaymentUrl(null);
    setTicketCode(null);

    try {
      const res = await api.post(`/events/${ticketTypeId}/checkout`, {
        ticketTypeId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod,
      });

      // Wallet payment → show ticket immediately
      if (paymentMethod === "wallet" && res.data.ticket) {
        setTicketCode(res.data.ticket.code);
      }

      // Paystack payment → redirect link
      if (paymentMethod === "paystack" && res.data.paymentUrl) {
        setPaymentUrl(res.data.paymentUrl);
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || "Payment failed. Try again.");
      setStatus("error");
    }
  };

  if (!ticketTypeId) {
    return <p className="p-4 text-red-500">Ticket type not specified.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Full Name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />
        <input
          type="email"
          placeholder="Email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />
        <input
          placeholder="Phone Number"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        >
          <option value="wallet">Wallet</option>
          <option value="paystack">Paystack</option>
        </select>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90"
        >
          {status === "sending" ? "Processing..." : "Pay"}
        </button>
      </form>

      {/* Success messages */}
      {status === "success" && (
        <div className="mt-4 space-y-2">
          {/* Wallet ticket */}
          {ticketCode && (
            <p className="text-green-600 font-medium">
              Payment successful! Your ticket code: <span className="font-bold">{ticketCode}</span>
            </p>
          )}

          {/* Paystack redirect */}
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline font-medium"
            >
              Complete Payment
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && errorMessage && (
        <p className="mt-4 text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
