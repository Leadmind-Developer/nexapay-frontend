"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  sold?: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
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

  if (loading) return <p className="p-4">Loading event...</p>;
  if (!event) return <p className="p-4 text-red-500">Event not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(event.startAt).toLocaleString()} - {new Date(event.endAt).toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mb-6">Organizer: {event.organizer.name}</p>

      <h2 className="text-2xl font-semibold mb-2">Tickets</h2>
      <div className="space-y-4">
        {event.ticketTypes.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/events/${event.id}/checkout?ticketTypeId=${ticket.id}`}
            className="block p-4 border rounded-xl hover:bg-gray-50 transition"
          >
            {ticket.name} - ₦{ticket.price.toLocaleString()}
          </Link>
        ))}
      </div>
    </div>
  );
}
