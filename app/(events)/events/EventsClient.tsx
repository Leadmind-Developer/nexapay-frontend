
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { getEventImage } from "@/lib/getEventImage";

/* ===================== TYPES ===================== */

interface Event {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  startAt: string;
  category?: string;
  city?: string;
  country?: string;
  ticketTypes?: { price: number }[];
  images?: { url: string }[];
  organizer?: { name: string } | null;
  type: "PHYSICAL" | "VIRTUAL";
}

interface EventsClientProps {
  initialEvents: Event[];
  eventsUnavailable: boolean;
}

/* ===================== CONSTANTS ===================== */

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Food & Drink", value: "FOOD_AND_DRINK" },
  { label: "Career & Business", value: "CAREER_AND_BUSINESS" },
  { label: "Spirituality & Religion", value: "SPIRITUALITY_AND_RELIGION" },
  { label: "Art & Culture", value: "ART_AND_CULTURE" },
  { label: "Community", value: "COMMUNITY" },
];

const PRICE_FILTERS = ["All", "Free", "Paid"];

/* ===================== HELPERS ===================== */

function getMinPrice(event: Event): number | null {
  const ticketTypes = event.ticketTypes ?? [];

  if (ticketTypes.length === 0) {
    return null;
  }

  const prices = ticketTypes
    .map((ticket) => Number(ticket.price))
    .filter((price) => Number.isFinite(price) && price >= 0);

  return prices.length > 0 ? Math.min(...prices) : null;
}

function isFreeEvent(event: Event): boolean {
  return getMinPrice(event) === 0;
}

/* ===================== COMPONENT ===================== */

export default function EventsClient({
  initialEvents,
  eventsUnavailable,
}: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(eventsUnavailable);

  const firstLoadSkipped = useRef(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("All");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("latest");

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    price !== "All" ||
    location.trim() !== "";

  /* ================= FETCH FILTERED EVENTS ================= */

  useEffect(() => {
    if (!firstLoadSkipped.current) {
      firstLoadSkipped.current = true;
      return;
    }

    let active = true;

    const fetchEvents = async () => {
      setLoading(true);
      setApiUnavailable(false);

      try {
        const res = await api.get("/events", {
          params: {
            q: search.trim() || undefined,
            category: category !== "All" ? category : undefined,
            price: price !== "All" ? price.toLowerCase() : undefined,
            city: location.trim() || undefined,
            sort,
            limit: 50,
          },
        });

        if (!Array.isArray(res.data)) {
          throw new Error("Unexpected events API response.");
        }

        if (active) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error("Failed loading events:", err);

        if (active) {
          setApiUnavailable(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      active = false;
    };
  }, [search, category, price, location, sort]);

  /* ================= FEATURED ================= */

  const featured = events.slice(0, 3);
  const rest = events.slice(3);
  const visibleEvents = rest.slice(0, 12);

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ================= HERO ================= */}

      <section className="bg-gradient-to-br from-black to-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Events Near You
          </h2>

          <p className="text-lg text-gray-300">
            Concerts, workshops, conferences, parties and more.
          </p>

          <div className="mt-8 max-w-2xl mx-auto flex bg-white rounded-xl overflow-hidden shadow-lg">
            <input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search events"
              className="flex-1 min-w-0 px-4 py-3 text-black outline-none"
            />

            <button
              type="button"
              onClick={() => setSearch((current) => current.trim())}
              className="bg-black text-white px-6"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}

      {!loading && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl dark:text-black font-bold mb-6">
            {hasActiveFilters ? "Matching Events" : "Featured Events"}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ================= FILTERS ================= */}

      <section className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              aria-pressed={category === cat.value}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                category === cat.value
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Filter by ticket price"
            className="rounded-xl border px-4 py-2 bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          >
            {PRICE_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="City or country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Filter by location"
            className="rounded-xl border px-4 py-2 bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort events"
            className="rounded-xl border px-4 py-2 bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          >
            <option value="latest">Latest</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </section>

      {/* ================= EVENTS GRID ================= */}

      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading && (
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Loading events"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse bg-white"
              >
                <div className="aspect-[16/9] bg-gray-200" />

                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && apiUnavailable && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Events are temporarily unavailable
            </h2>

            <p className="text-gray-600">
              We are having trouble loading events right now. Please try again
              shortly.
            </p>
          </div>
        )}

        {!loading && !apiUnavailable && events.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              {hasActiveFilters
                ? "No matching events found"
                : "No upcoming events at the moment"}
            </h2>

            <p className="text-gray-600">
              {hasActiveFilters
                ? "Try changing your search or filters to discover other events."
                : "There are currently no upcoming events. Please check back soon for new experiences."}
            </p>
          </div>
        )}

        {!loading && !apiUnavailable && visibleEvents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !apiUnavailable && rest.length > 12 && (
          <div className="text-center mt-12">
            <Link
              href="/events/all"
              className="inline-block px-6 py-3 rounded-xl border hover:bg-gray-100"
            >
              Show all events →
            </Link>
          </div>
        )}
      </section>

      {/* ================= CTA ================= */}

      <section className="bg-black text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-3">
            Ready to host your own event?
          </h2>

          <p className="text-gray-300 mb-6">
            Create events, sell tickets and manage attendees with Nexa Events.
          </p>

          <Link
            href="/organizer/events"
            className="inline-block bg-white text-black px-6 py-3 rounded-xl font-medium"
          >
            Go to Organizer Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===================== EVENT CARD ===================== */

function EventCard({ event }: { event: Event }) {
  const imageUrl = getEventImage(event);
  const minPrice = getMinPrice(event);
  const free = isFreeEvent(event);

  const locationLabel =
    event.type === "VIRTUAL"
      ? "Virtual"
      : [event.city, event.country].filter(Boolean).join(", ") ||
        "Physical Event";

  const eventDate = new Date(event.startAt);

  const formattedDate = Number.isNaN(eventDate.getTime())
    ? "Date to be announced"
    : eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const priceLabel =
    minPrice === null
      ? "Price unavailable"
      : free
        ? "Free"
        : `₦${minPrice.toLocaleString()}`;

  return (
    <Link
      href={`/events/${encodeURIComponent(event.slug)}`}
      className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition"
    >
      <div className="relative aspect-[16/9] bg-gray-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        )}

        <div className="absolute top-3 left-3">
          {minPrice === null ? (
            <span className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full font-medium">
              PRICE TBA
            </span>
          ) : free ? (
            <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              FREE
            </span>
          ) : (
            <span className="bg-purple-700 text-white text-xs px-3 py-1 rounded-full font-medium">
              PAID
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-2">
        {event.category && (
          <p className="text-xs text-gray-500">{event.category}</p>
        )}

        <h3 className="text-lg dark:text-black font-semibold line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
          📍 {locationLabel}
        </p>

        <div className="flex justify-between items-center text-xs pt-2 gap-3">
          <span className="font-semibold text-indigo-600">
            {priceLabel}
          </span>

          <span className="font-medium text-gray-600 flex items-center gap-1">
            📅 {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
