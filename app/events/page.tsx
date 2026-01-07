"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getEventImage } from "@/lib/getEventImage";

interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  startAt: string;
  endAt: string;
  organizer: { name: string };
}

export default function EventsLandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Event[]>("/events")
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover & Attend Amazing Events
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Buy tickets for conferences, concerts, workshops and more.
          </p>
          <Link
            href="#events"
            className="inline-block bg-white text-black px-6 py-3 rounded-xl font-medium"
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* EVENTS LIST */}
      <section id="events" className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>

        {loading && <p>Loading events...</p>}

        {!loading && events.length === 0 && (
          <p className="text-gray-500">No upcoming events.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link
              key={event.id}
              href={`/events/${event.slug ?? event.id}`}
              className="block border rounded-xl p-5 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(event.startAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ORGANIZER CTA */}
      <section className="bg-gray-50 py-16 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-semibold mb-3">
            Hosting an event?
          </h3>
          <p className="text-gray-600 mb-6">
            Create, sell tickets and manage attendees in one dashboard.
          </p>
          <Link
            href="/organizer/events"
            className="inline-block bg-black text-white px-6 py-3 rounded-xl"
          >
            Go to Organizer Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
