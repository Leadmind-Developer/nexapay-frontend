// app/events/[id]/checkout/page.tsx
"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useSearchParams, useParams } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

/* ==================== CLIENT ONLY WRAPPER ==================== */
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

/* ==================== TYPES ==================== */
type PaymentMethod = "wallet" | "paystack";

interface EventImage {
  url: string;
  isPrimary?: boolean;
}

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
  category?: string;
  ticketTypes: TicketType[];
  images?: EventImage[];
}

/* ==================== COMPONENT ==================== */
export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.id as string;
  const ticketTypeId = searchParams.get("ticketTypeId");
  const reference = searchParams.get("reference");

  /* ==================== STATE ==================== */
  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* ==================== FETCH EXISTING ORDER ==================== */
  useEffect(() => {
    if (!reference) return;
    setStatus("sending");

    api
      .get(`/events/orders/${reference}`)
      .then((res) => {
        const order = res.data;
        if (order.ticket) {
          setTicketCode(order.ticket.code);
          setStatus("success");
        } else setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, [reference]);

  /* ==================== FETCH EVENT + TICKET ==================== */
  useEffect(() => {
    if (!ticketTypeId) return;

    const fetchCheckoutData = async () => {
      try {
        const res = await api.get<Event>(`/events/${eventId}`);
        const eventData = res.data;
        setEvent(eventData);

        const selectedTicket = eventData.ticketTypes.find(
          (t) => t.id.toString() === ticketTypeId.toString()
        );
        if (!selectedTicket) throw new Error("Ticket not found");
        setTicket(selectedTicket);

        if (eventData.category) {
          const related = await api.get<Event[]>(`/events?category=${eventData.category}&limit=6`);
          setRelatedEvents(related.data.filter((e) => e.id !== eventData.id).slice(0, 6));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load checkout details");
      }
    };

    fetchCheckoutData();
  }, [eventId, ticketTypeId]);

  /* ==================== CLIENT-SIDE USER FETCH ==================== */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        const u = res.data.user;
        setUser(u || null);

        // Autofill form
        setBuyerName(u?.name || "");
        setBuyerEmail(u?.email || "");
        setBuyerPhone(u?.phone || "");
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  /* ==================== FORM SUBMIT ==================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await api.post("/events/checkout", {
        ticketTypeId,
        quantity,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod: ticket?.price === 0 ? "wallet" : paymentMethod,
      });

      const data = res.data;

      if (data.ticket) {
        setTicketCode(data.ticket.code);
        setStatus("success");
        return;
      }

      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Checkout failed");
      setStatus("error");
    }
  };

  /* ==================== RENDER HELPERS ==================== */
  if (!ticketTypeId)
    return <div className="p-10 text-center text-red-500">Ticket not specified</div>;

  if (!event || !ticket)
    return <div className="p-10 text-center text-gray-500">Loading checkout...</div>;

  const heroImage = event.images?.find((i) => i.isPrimary)?.url || event.images?.[0]?.url;
  const isFree = ticket.price === 0;
  const locationLabel =
    event.type === "VIRTUAL"
      ? "Virtual Event"
      : [event.address, event.city, event.country].filter(Boolean).join(", ");
  const formattedDate = new Date(event.startAt).toLocaleString();
  const totalAmount = ticket.price * quantity;

  /* ==================== MAIN RENDER ==================== */
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      {/* ================= EVENT SUMMARY ================= */}
      <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow">
        {heroImage && (
          <div className="relative w-full md:w-72 h-52 md:h-auto">
            <Image src={heroImage} alt={event.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 space-y-2 flex-1">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              isFree ? "bg-green-600 text-white" : "bg-indigo-600 text-white"
            }`}
          >
            {isFree ? "Free Event" : "Paid Event"}
          </span>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-500">📅 {formattedDate}</p>
          <p className="text-sm text-gray-500">📍 {locationLabel}</p>
        </div>
      </div>

      {/* ================= ORDER SUMMARY ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <div className="flex justify-between">
          <span>{ticket.name}</span>
          <span>{isFree ? "Free" : `₦${ticket.price.toLocaleString()}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Attendees</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 border rounded-lg px-2 py-1 text-center"
          />
        </div>
        <hr />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{isFree ? "Free" : `₦${totalAmount.toLocaleString()}`}</span>
        </div>
      </div>

      {/* ================= CLIENT-ONLY: USER / AUTH ================= */}
      <ClientOnly>
        {!loadingUser && !user && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl text-center space-y-3">
            <p className="font-semibold">Have an account?</p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="text-indigo-600 font-medium hover:underline">Login</Link>
              <Link href="/register" className="text-indigo-600 font-medium hover:underline">Create account</Link>
            </div>
          </div>
        )}
        {!loadingUser && user && (
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-2xl text-center space-y-1">
            <p className="font-semibold text-green-700 dark:text-green-300">Logged in as</p>
            <p className="font-medium">{user?.name ?? "N/A"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email ?? "N/A"}</p>
          </div>
        )}
      </ClientOnly>

      {/* ================= CLIENT-ONLY: BUYER FORM ================= */}
      <ClientOnly>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4"
        >
          <h2 className="text-xl font-semibold">Your Details</h2>
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
          {!isFree && (
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="paystack">Paystack</option>
              <option value="wallet">Wallet</option>
            </select>
          )}
          <button
            disabled={status === "sending"}
            className="w-full bg-black text-white rounded-xl py-3 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending"
              ? "Processing..."
              : isFree
              ? "Get Free Ticket"
              : "Proceed to Payment"}
          </button>
        </form>
      </ClientOnly>

      {/* ================= SUCCESS ================= */}
      {status === "success" && ticketCode && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="font-semibold text-green-700">🎉 Ticket issued!</p>
          <p className="mt-2 font-mono">{ticketCode}</p>
        </div>
      )}

      {/* ================= ERROR ================= */}
      {status === "error" && errorMessage && (
        <p className="text-red-500 text-center">{errorMessage}</p>
      )}

      {/* ================= SIMILAR EVENTS ================= */}
      {relatedEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Other Events You May Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {relatedEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="min-w-[220px] border rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition"
              >
                <div className="h-32 relative bg-gray-200">
                  {ev.images?.[0] && (
                    <Image src={ev.images[0].url} alt={ev.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm text-indigo-600 font-semibold">{ev.category}</p>
                  <p className="font-semibold line-clamp-2">{ev.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
