"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { getEventImage } from "@/lib/getEventImage";

/* ===================== TYPES ===================== */

interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  startAt: string;
  category?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  ticketTypes?: { price: number }[];
  images?: { url: string }[];
  organizer: { name: string };
  type: "PHYSICAL" | "VIRTUAL";
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

function getMinPrice(event: Event) {
  if (!event.ticketTypes || event.ticketTypes.length === 0) return 0;
  return Math.min(...event.ticketTypes.map(t => Number(t.price)));
}

function isFreeEvent(event: Event) {
  return getMinPrice(event) === 0;
}

/* ===================== COMPONENT ===================== */

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents || []);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("All");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("latest");

  /* ---------------- FETCH EVENTS (CLIENT FILTERING) ---------------- */

  useEffect(() => {
    // Skip first load (we already have SSR data)
    if (!search && category === "All" && price === "All" && !location && sort === "latest") {
      return;
    }

    setLoading(true);

    api
      .get("/events", {
        params: {
          q: search || undefined,
          category: category !== "All" ? category : undefined,
          price: price !== "All" ? price.toLowerCase() : undefined,
          city: location || undefined,
          sort,
          limit: 50,
        },
      })
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, price, location, sort]);

  /* ---------------- FEATURE + GRID ---------------- */

  const featured = events.slice(0, 3);
  const rest = events.slice(3);
  const visibleEvents = rest.slice(0, 12);

  /* ===================== RENDER ===================== */

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HERO ================= */}

      <section className="bg-gradient-to-br from-black to-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Events Near You
          </h1>

          <p className="text-lg text-gray-300">
            Concerts, workshops, conferences, parties and more 
          </p>

          <div className="mt-8 max-w-2xl mx-auto flex bg-white rounded-xl overflow-hidden shadow-lg">
            <input
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-black outline-none"
            />
            <button className="bg-black text-white px-6">
              Search
            </button>
          </div>

        </div>
      </section>

      {/* ================= FEATURED ================= */}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl dark:text-black font-bold mb-6">
            Featured Events
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ================= FILTER BAR ================= */}

      <section className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
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
            onChange={e => setPrice(e.target.value)}
            className="rounded-xl border px-4 py-2"
          >
            {PRICE_FILTERS.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <input
            placeholder="City or country"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="rounded-xl border px-4 py-2"
          />

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="rounded-xl border px-4 py-2"
          >
            <option value="latest">Latest</option>
            <option value="upcoming">Upcoming</option>
          </select>

        </div>

      </section>

      {/* ================= EVENTS GRID ================= */}

      <section className="max-w-7xl mx-auto px-6 pb-20">

        {loading && <p>Loading events...</p>}

        {!loading && visibleEvents.length === 0 && (
          <div>
            <h2>No events found</h2>
            <p>Try adjusting filters or check back later.</p>
          </div>
        )}

        {!loading && visibleEvents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && rest.length > 12 && (
          <div className="text-center mt-12">
            <Link href="/events/all" className="px-6 py-3 border rounded-xl">
              Show all events →
            </Link>
          </div>
        )}

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
      : [event.city, event.country].filter(Boolean).join(", ") || "Physical Event";

  const formattedDate = new Date(event.startAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/events/${event.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow">

      <div className="relative aspect-[16/9] bg-gray-100">
        {imageUrl && (
          <Image src={imageUrl} alt={event.title} fill className="object-cover" />
        )}
      </div>

      <div className="p-5 space-y-2">
        <p className="text-xs text-gray-500">{event.category}</p>
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-green-600">📍 {locationLabel}</p>

        <div className="flex justify-between text-xs pt-2">
          <span className="font-semibold text-indigo-600">
            {free ? "Free" : `₦${minPrice.toLocaleString()}`}
          </span>
          <span>📅 {formattedDate}</span>
        </div>
      </div>

    </Link>
  );
}
