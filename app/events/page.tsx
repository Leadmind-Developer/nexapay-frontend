"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { getEventImage } from "@/lib/getEventImage";

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

/* ===================== PAGE ===================== */

export default function EventsLandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("All");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("latest");

  /* ---------------- FETCH EVENTS ---------------- */

  useEffect(() => {
    setLoading(true);

    api
      .get("/events", {
        params: {
          q: search || undefined,
          category: category !== "All" ? category : undefined,
          price: price !== "All" ? price.toLowerCase() : undefined,
          city: location || undefined,
          sort,
          limit: 50, // fetch more so we can feature + slice
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
            Concerts, workshops, conferences, parties and more 🎉
          </p>

          {/* SEARCH BAR */}
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

      {!loading && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">

          <h2 className="text-2xl font-bold mb-6">
            Featured Events 🔥
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

        {/* CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto pb-2">

          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                ${
                  category === cat.value
                    ? "bg-black text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
            >
              {cat.label}
            </button>
          ))}

        </div>

        {/* FILTER ROW */}
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

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-white">
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleEvents.length === 0 && (
          <p className="text-gray-500">No events found.</p>
        )}

        {!loading && visibleEvents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* SHOW ALL */}

        {!loading && rest.length > 12 && (
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

          <h3 className="text-2xl font-semibold mb-3">
            Ready to host your own event?
          </h3>

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
    event.city || event.country
      ? `${event.city ?? event.country}`
      : "Virtual";

  const formattedDate = new Date(event.startAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition"
    >
      {/* IMAGE */}
      <div className="relative aspect-[16/9] bg-gray-100">

        {imageUrl && (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        )}

        {/* FREE / PAID BADGE */}
        <div className="absolute top-3 left-3">
          {free ? (
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

      {/* CONTENT */}
      <div className="p-5 space-y-2">

        {/* CATEGORY */}
        <p className="text-xs text-gray-500">
          {event.category}
        </p>

        {/* TITLE */}
        <h3 className="text-lg font-semibold line-clamp-2">
          {event.title}
        </h3>

        {/* LOCATION (replacing description) */}
        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
          📍 {locationLabel}
        </p>

        <div className="flex justify-between items-center text-xs pt-2">

          {/* PRICE */}
          <span className="font-semibold text-indigo-600">
            {free ? "Free" : `₦${minPrice.toLocaleString()}`}
          </span>

          {/* DATE WITH ICON */}
          <span className="font-medium text-gray-600 flex items-center gap-1">
            📅 {formattedDate}
          </span>

        </div>

      </div>
    </Link>
  );
}

