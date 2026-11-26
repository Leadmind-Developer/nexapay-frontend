
"use client";

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
  slug: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  type: "PHYSICAL" | "VIRTUAL";
  address?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  category?: string | null;
  organizer?: { name: string } | null;
  ticketTypes: TicketType[];
  images?: EventImage[];
}

interface EventClientProps {
  event: Event;
  relatedEvents: Event[];
}

/* ===================== HELPERS ===================== */

function getHeroImage(event: Event): string | undefined {
  return (
    event.images?.find((image) => image.isPrimary)?.url ||
    event.images?.[0]?.url
  );
}

function getLocationLabel(event: Event): string {
  if (event.type === "VIRTUAL") {
    return "Virtual Event";
  }

  return [
    event.venue,
    event.address,
    event.city,
    event.country,
  ]
    .filter(Boolean)
    .join(", ") || "Physical Event";
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ===================== COMPONENT ===================== */

export default function EventClient({
  event,
  relatedEvents,
}: EventClientProps) {
  const heroImage = getHeroImage(event);
  const locationLabel = getLocationLabel(event);

  const mapQuery = encodeURIComponent(locationLabel);

  const tickets = event.ticketTypes ?? [];

  const isFree =
    tickets.length > 0 &&
    tickets.every((ticket) => Number(ticket.price) === 0);

  const hasPaidTickets = tickets.some(
    (ticket) => Number(ticket.price) > 0
  );

  const eventPriceLabel =
    tickets.length === 0
      ? "Tickets coming soon"
      : isFree
        ? "Free Event"
        : hasPaidTickets
          ? "Paid Event"
          : "Ticket information";

  return (
    <div className="space-y-16 pb-20">

      {/* ================= HERO ================= */}

      {heroImage && (
        <div className="relative w-full h-[240px] sm:h-[360px] md:h-[420px]">
          <Image
            src={heroImage}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto text-white space-y-3">
            <span className="inline-block bg-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
              {eventPriceLabel}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold">
              {event.title}
            </h1>

            {event.category && (
              <p className="text-sm opacity-90">
                {event.category}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Show title even when the event has no image */}
      {!heroImage && (
        <section className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
          <div className="max-w-5xl mx-auto px-6 space-y-3">
            <span className="inline-block bg-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
              {eventPriceLabel}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold">
              {event.title}
            </h1>

            {event.category && (
              <p className="text-sm text-gray-300">
                {event.category}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ================= MAIN CONTENT ================= */}

      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1.6fr_1fr] gap-10">

        {/* LEFT */}

        <div className="space-y-10">

          {/* EVENT META */}

          <div className="space-y-3 text-gray-700 dark:text-gray-300">

            <div className="flex items-center gap-2">
              📅 {formatDate(event.startAt)}
              {formatTime(event.startAt) &&
                ` • ${formatTime(event.startAt)}`}
            </div>

            <div className="flex items-center gap-2">
              📍 {locationLabel}
            </div>

            {event.organizer?.name && (
              <div className="flex items-center gap-2">
                👤 Organized by {event.organizer.name}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">
              About this event
            </h2>

            <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description?.trim() ||
                "More information about this event will be available soon."}
            </p>
          </section>

          {/* LOCATION / VIRTUAL EVENT */}

          {event.type === "PHYSICAL" ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">
                Location
              </h2>

              {locationLabel !== "Physical Event" && (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-indigo-600 font-medium hover:underline"
                  >
                    Get Directions →
                  </a>

                  <iframe
                    title={`Map showing ${locationLabel}`}
                    className="w-full h-64 rounded-xl border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  />
                </>
              )}

              {locationLabel === "Physical Event" && (
                <p className="text-gray-600 dark:text-gray-300">
                  The event location will be announced by the organizer.
                </p>
              )}
            </section>
          ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-2">
                Virtual Event
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                This event will be hosted online. Access details will be
                provided after checkout.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT - TICKETS */}

        <aside className="space-y-4 sticky top-24 h-fit">

          <h2 className="text-2xl font-semibold">
            Tickets
          </h2>

          {tickets.length === 0 && (
            <div className="border rounded-2xl p-5 bg-white dark:bg-gray-800">
              <p className="font-medium">
                Tickets are not available yet.
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Please check back later for ticket information.
              </p>
            </div>
          )}

          {tickets.map((ticket) => {
            const isSoldOut =
              ticket.sold >= ticket.quantity;

            const content = (
              <div
                className={`border rounded-2xl p-5 transition ${
                  isSoldOut
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                    : "bg-white dark:bg-gray-800 hover:border-indigo-600 hover:shadow-lg"
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold text-lg">
                      {ticket.name}
                    </p>

                    <p
                      className={`text-sm ${
                        isSoldOut
                          ? "text-red-500 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {isSoldOut
                        ? "Sold out"
                        : `${Math.max(
                            0,
                            ticket.quantity - ticket.sold
                          )} left`}
                    </p>
                  </div>

                  <p
                    className={`text-xl font-bold ${
                      isSoldOut
                        ? "text-gray-400"
                        : "text-indigo-600"
                    }`}
                  >
                    {ticket.price === 0
                      ? "Free"
                      : `₦${ticket.price.toLocaleString()}`}
                  </p>
                </div>
              </div>
            );

            if (isSoldOut) {
              return (
                <div key={ticket.id}>
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={ticket.id}
                href={`/events/${event.id}/checkout?ticketTypeId=${encodeURIComponent(
                  ticket.id
                )}`}
              >
                {content}
              </Link>
            );
          })}
        </aside>
      </div>

      {/* ================= RELATED EVENTS ================= */}

      {relatedEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-semibold">
            Other Events You May Like
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((related) => (
              <Link
                key={related.id}
                href={`/events/${encodeURIComponent(related.slug)}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition bg-white dark:bg-gray-800"
              >
                <div className="h-40 bg-gray-200 relative">
                  {related.images?.[0] && (
                    <Image
                      src={related.images[0].url}
                      alt={related.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="p-4 space-y-1">
                  {related.category && (
                    <p className="text-sm text-indigo-600 font-semibold">
                      {related.category}
                    </p>
                  )}

                  <h3 className="font-semibold line-clamp-2">
                    {related.title}
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
