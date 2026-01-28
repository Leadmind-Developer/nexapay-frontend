"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface EventImage {
  url: string;
  isPrimary?: boolean;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
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
  images?: EventImage[];
}

export default function EventPage() {
  const params = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get<Event>(`/events/${params.id}`);
        setEvent(res.data);

        if (res.data.category) {
          const related = await api.get<Event[]>(
            `/events?category=${res.data.category}&limit=6`
          );
          setRelatedEvents(
            related.data.filter((e) => e.id !== res.data.id).slice(0, 6)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading event...</div>;

  if (!event)
    return <div className="p-10 text-center text-red-500">Event not found</div>;

  const heroImage =
    event.images?.find((img) => img.isPrimary)?.url ||
    event.images?.[0]?.url;

  const isFree = event.ticketTypes.every((t) => t.price === 0);

  const locationLabel =
    event.type === "VIRTUAL"
      ? "Virtual Event"
      : [event.address, event.city, event.country].filter(Boolean).join(", ");

  const mapQuery = encodeURIComponent(locationLabel);

  const startDate = new Date(event.startAt);

  return (
    <div className="space-y-16 pb-20">

      {/* ===== HERO IMAGE ===== */}
      {heroImage && (
        <div className="relative w-full h-[240px] sm:h-[360px] md:h-[420px]">
          <Image
            src={heroImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto text-white space-y-3">
            <span className="inline-block bg-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
              {isFree ? "Free Event" : "Paid Event"}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold">
              {event.title}
            </h1>

            <p className="text-sm opacity-90">
              {event.category}
            </p>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1.6fr_1fr] gap-10">

        {/* LEFT */}
        <div className="space-y-10">

          {/* META */}
          <div className="space-y-3 text-gray-700 dark:text-gray-300">

            <div className="flex items-center gap-2">
              📅 {startDate.toLocaleDateString()} •{" "}
              {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div className="flex items-center gap-2">
              📍 {locationLabel}
            </div>

            <div className="flex items-center gap-2">
              👤 Organized by {event.organizer.name}
            </div>
          </div>

          {/* DESCRIPTION */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </section>

          {/* MAP / VIRTUAL */}
          {event.type === "PHYSICAL" ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Location</h2>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                className="inline-block text-indigo-600 font-medium hover:underline"
              >
                Get Directions →
              </a>

              <iframe
                className="w-full h-64 rounded-xl border"
                loading="lazy"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              />
            </section>
          ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-2">Virtual Event</h2>
              <p className="text-gray-600 dark:text-gray-300">
                This event will be hosted online. Access details will be provided after checkout.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT - TICKETS */}
        <aside className="space-y-4 sticky top-24 h-fit">

          <h2 className="text-2xl font-semibold">Tickets</h2>

          {event.ticketTypes.map((ticket) => {
  const isSoldOut = ticket.sold >= ticket.quantity;

  const content = (
    <div
      className={`block border rounded-2xl p-5 transition
        ${
          isSoldOut
            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
            : "bg-white dark:bg-gray-800 hover:border-indigo-600 hover:shadow-lg"
        }
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">
            {ticket.name}
          </p>

          <p
            className={`text-sm ${
              isSoldOut ? "text-red-500 font-semibold" : "text-gray-500"
            }`}
          >
            {isSoldOut
              ? "Sold out"
              : `${ticket.quantity - ticket.sold} left`}
          </p>
        </div>

        <p
          className={`text-xl font-bold ${
            isSoldOut ? "text-gray-400" : "text-indigo-600"
          }`}
        >
          {ticket.price === 0
            ? "Free"
            : `₦${ticket.price.toLocaleString()}`}
        </p>
      </div>
    </div>
  );

  // If sold out → no link
  if (isSoldOut) {
    return <div key={ticket.id}>{content}</div>;
  }

  // If available → clickable
  return (
    <Link
      key={ticket.id}
      href={`/events/${event.id}/checkout?ticketTypeId=${ticket.id}`}
    >
      {content}
    </Link>
  );
})}

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {ticket.name}
                  </p>
                  <p className="text-sm text-gray-500">Limited availability</p>
                </div>

                <p className="text-xl font-bold text-indigo-600">
                  {ticket.price === 0
                    ? "Free"
                    : `₦${ticket.price.toLocaleString()}`}
                </p>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      {/* ===== RELATED EVENTS ===== */}
      {relatedEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-semibold">
            Other Events You May Like
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition bg-white dark:bg-gray-800"
              >
                <div className="h-40 bg-gray-200 relative">
                  {ev.images?.[0] && (
                    <Image
                      src={ev.images[0].url}
                      alt={ev.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <p className="text-sm text-indigo-600 font-semibold">
                    {ev.category}
                  </p>
                  <h3 className="font-semibold line-clamp-2">
                    {ev.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
