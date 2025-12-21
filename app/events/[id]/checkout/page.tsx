"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const ticketTypeId = searchParams.get("ticketTypeId");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack" | "flutterwave">("wallet");
  const [status, setStatus] = useState<"sending" | "success" | "error" | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTypeId) return;

    setStatus("sending");

    try {
      const res = await api.post("/events/" + ticketTypeId + "/checkout", {
        ticketTypeId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod,
      });

      if (res.data.paymentUrl) setPaymentUrl(res.data.paymentUrl);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (!ticketTypeId) return <p className="p-4 text-red-500">Ticket type not specified</p>;

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
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        >
          <option value="wallet">Wallet</option>
          <option value="paystack">Paystack</option>
          <option value="flutterwave">Flutterwave</option>
        </select>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90"
        >
          {status === "sending" ? "Processing..." : "Pay"}
        </button>
      </form>

      {status === "success" && paymentUrl && (
        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block mt-4 text-blue-600 hover:underline">
          Complete Payment
        </a>
      )}
      {status === "error" && <p className="mt-4 text-red-500">Payment failed. Try again.</p>}
    </div>
  );
}
