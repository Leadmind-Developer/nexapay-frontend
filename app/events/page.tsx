"use client";

import { useEffect, useState } from "react";
import api, { Payload } from "@/lib/api";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  startAt: string;
  endAt: string;
  organizer: { name: string };
  ticketTypes: { id: string; name: string; price: number }[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>("/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading events...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="p-4 border rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-gray-600">{event.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(event.startAt).toLocaleString()} - {new Date(event.endAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Organizer: {event.organizer.name}</p>
            <Link href={`/events/${event.id}`} className="mt-2 inline-block text-blue-600 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
