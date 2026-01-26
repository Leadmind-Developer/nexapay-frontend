"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";

type PaymentMethod = "wallet" | "paystack";

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  startAt: string;
  type: "PHYSICAL" | "VIRTUAL";
  address?: string;
  city?: string;
  country?: string;
  images?: { url: string; isPrimary?: boolean }[];
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.id as string;
  const ticketTypeId = searchParams.get("ticketTypeId");

  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("paystack");

  const [status, setStatus] =
    useState<"idle" | "sending" | "success" | "error">("idle");

  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ================= FETCH EVENT + TICKET ================= */
  const reference = searchParams.get("reference");

useEffect(() => {
  if (!reference) return;

  setStatus("sending");

  api
    .get(`/events/orders/${reference}`)
    .then(res => {
      const order = res.data;

      if (order.ticket) {
        setTicketCode(order.ticket.code);
        setStatus("success");
      } else if (order.paymentStatus === "pending") {
        setStatus("idle");
      } else {
        setStatus("idle");
      }
    })
    .catch(err => {
      console.error(err);
      setStatus("idle");
    });
}, [reference]);


  useEffect(() => {
    if (!ticketTypeId) return;

    const loadCheckoutData = async () => {
      try {
        const res = await api.get<any>(`/events/${eventId}`);

        const eventData = res.data;
        
        setEvent(eventData);

        const ticketRes = await api.get<TicketType>(
          `/events/ticket-types/${ticketTypeId}`
        );
        setTicket(ticketRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [eventId, ticketTypeId]);

  if (!ticketTypeId)
    return (
      <div className="p-10 text-center text-red-500">
        Ticket type not specified
      </div>
    );

  if (!event || !ticket)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading checkout...
      </div>
    );

  const heroImage =
    event.images?.find((i) => i.isPrimary)?.url || event.images?.[0]?.url;

  const isFree = ticket.price === 0;

  const locationLabel =
    event.type === "VIRTUAL"
      ? "Virtual Event"
      : [event.address, event.city, event.country].filter(Boolean).join(", ");

  const formattedDate = new Date(event.startAt).toLocaleString();

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await api.post("/events/checkout", {
        ticketTypeId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod: isFree ? "wallet" : paymentMethod,
      });

      const data = res.data;

      // Free or wallet checkout → instant ticket
      if (data.ticket) {
        setTicketCode(data.ticket.code);
        setStatus("success");
        return;
      }

      // Paystack redirect
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || "Checkout failed"
      );
      setStatus("error");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

      {/* ===== EVENT SUMMARY ===== */}

      <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow">

        {heroImage && (
          <div className="relative w-full md:w-64 h-48 md:h-auto">
            <Image
              src={heroImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-2 flex-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>

          <p className="text-sm text-gray-500">
            📅 {formattedDate}
          </p>

          <p className="text-sm text-gray-500">
            📍 {locationLabel}
          </p>
        </div>
      </div>

      {/* ===== ORDER SUMMARY ===== */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">

        <h2 className="text-xl font-semibold">Order summary</h2>

        <div className="flex justify-between">
          <span>{ticket.name}</span>
          <span>
            {isFree ? "Free" : `₦${ticket.price.toLocaleString()}`}
          </span>
        </div>

        <hr />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>
            {isFree ? "Free" : `₦${ticket.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* ===== BUYER FORM ===== */}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4"
      >
        <h2 className="text-xl font-semibold">Your details</h2>

        <input
          required
          placeholder="Full name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          required
          type="email"
          placeholder="Email address"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          placeholder="Phone number"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        {/* ===== PAYMENT METHOD (ONLY IF PAID) ===== */}

        {!isFree && (
          <div className="space-y-2">
            <p className="font-medium">Payment method</p>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="paystack">Paystack</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        )}

        <button
          disabled={status === "sending"}
          className="w-full bg-black text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {status === "sending"
            ? "Processing..."
            : isFree
            ? "Get Free Ticket"
            : "Proceed to Payment"}
        </button>
      </form>

      {/* ===== SUCCESS ===== */}

      {status === "success" && ticketCode && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-green-700 font-semibold">
            🎉 Ticket issued successfully!
          </p>
          <p className="mt-2 text-sm">
            Ticket Code:
            <span className="ml-2 font-mono font-semibold">
              {ticketCode}
            </span>
          </p>
        </div>
      )}

      {/* ===== ERROR ===== */}

      {status === "error" && errorMessage && (
        <p className="text-red-500 text-center">{errorMessage}</p>
      )}
    </div>
  );
}
