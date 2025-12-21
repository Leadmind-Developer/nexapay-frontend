"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface Ticket {
  id: string;
  code: string;
  order: {
    buyerName: string;
    buyerEmail: string;
    ticketType: { name: string };
  };
}

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.id;

  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Ticket[]>(`/organizer/events/${eventId}/attendees`)
      .then((res) => setAttendees(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <p className="p-4">Loading attendees...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendees</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Ticket Type</th>
            <th className="border p-2">Code</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="border p-2">{ticket.order.buyerName}</td>
              <td className="border p-2">{ticket.order.buyerEmail}</td>
              <td className="border p-2">{ticket.order.ticketType.name}</td>
              <td className="border p-2">{ticket.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
