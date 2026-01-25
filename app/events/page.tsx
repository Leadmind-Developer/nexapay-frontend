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
  images?: { url: string }[];
  organizer: { name: string };
}

/* ===================== CONSTANTS ===================== */

const CATEGORIES = [
  "All",
  "Entertainment",
  "Food & Drink",
  "Career & Business",
  "Spirituality & Religion",
  "Art & Culture",
  "Community",
];

const PRICE_FILTERS = ["All", "Free", "Paid"];

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
        },
      })
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, price, location, sort]);

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
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-black outline-none"
            />
            <button className="bg-black text-white px-6">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ================= FILTER BAR ================= */}

      <section className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                ${
                  category === cat
                    ? "bg-black text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FILTER ROW */}
        <div className="flex flex-wrap gap-3">

          {/* PRICE */}
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl border px-4 py-2"
          >
            {PRICE_FILTERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          {/* LOCATION */}
          <input
            placeholder="City or country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border px-4 py-2"
          />

          {/* SORT */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
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

        {!loading && events.length === 0 && (
          <p className="text-gray-500">No events found.</p>
        )}

        {!loading && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {events.map((event) => {
              const imageUrl = getEventImage(event);
              const isFree = event.minPrice === 0;

              return (
                <Link
                  key={event.id}
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

                    {/* PRICE BADGE */}
                    <div className="absolute top-3 left-3">
                      {isFree ? (
                        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                          FREE
                        </span>
                      ) : (
                        <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 space-y-2">

                    <p className="text-xs text-gray-500">
                      {event.category}
                    </p>

                    <h3 className="text-lg font-semibold line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                      <span>
                        {new Date(event.startAt).toLocaleDateString()}
                      </span>

                      <span>
                        {event.city || event.country}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
