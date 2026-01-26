"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  type: "PHYSICAL" | "VIRTUAL";
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  organizer: { name: string };
  ticketTypes: TicketType[];
}

export default function EventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event>(`/events/${params.id}`)
      .then((res) => setEvent(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading event...</div>;

  if (!event)
    return <div className="p-8 text-center text-red-500">Event not found</div>;

  const locationLabel =
    event.type === "VIRTUAL"
      ? "Virtual Event"
      : [event.address, event.city, event.country].filter(Boolean).join(", ");

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

      {/* ===== HERO ===== */}
      <section className="space-y-4">
        <p className="text-sm text-indigo-600 font-semibold uppercase">
          {event.category || "Event"}
        </p>

        <h1 className="text-4xl font-bold leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            📅 {startDate.toLocaleDateString()} •{" "}
            {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          <span className="flex items-center gap-1">
            📍 {locationLabel}
          </span>

          <span className="flex items-center gap-1">
            👤 {event.organizer.name}
          </span>
        </div>
      </section>

      {/* ===== DESCRIPTION ===== */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">About this event</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </section>

      {/* ===== TICKETS ===== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tickets</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {event.ticketTypes.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/events/${event.id}/checkout?ticketTypeId=${ticket.id}`}
              className="group border rounded-2xl p-5 hover:border-indigo-600 hover:shadow-lg transition bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition">
                    {ticket.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Secure your spot
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">
                    {ticket.price === 0
                      ? "Free"
                      : `₦${ticket.price.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-400">per ticket</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <div className="text-center pt-6">
        <p className="text-sm text-gray-500">
          Select a ticket to continue to checkout
        </p>
      </div>
    </div>
  );
}
