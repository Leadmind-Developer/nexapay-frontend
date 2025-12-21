"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  published: boolean;
  ticketTypes: TicketType[];
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>("/organizer/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading events...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>

      <Link
        href="/organizer/events/create"
        className="inline-block mb-4 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
      >
        + Create New Event
      </Link>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 border rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-gray-500 text-sm">
              {new Date(event.startAt).toLocaleString()} - {new Date(event.endAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Tickets: {event.ticketTypes.length} | {event.published ? "Published" : "Draft"}
            </p>
            <div className="mt-2 space-x-2">
              <Link href={`/organizer/events/${event.id}/edit`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <Link href={`/organizer/events/${event.id}/attendees`} className="text-green-600 hover:underline">
                Attendees
              </Link>
              <Link href={`/organizer/events/${event.id}/stats`} className="text-purple-600 hover:underline">
                Stats
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
