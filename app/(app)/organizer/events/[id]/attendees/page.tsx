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
  const { id: eventId } = useParams<{ id: string }>();

  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    api
      .get<{ data: Ticket[] }>(
        `/events/organizer/events/${eventId}/attendees`
      )
      .then((res) => setAttendees(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading)
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading attendees…</p>;

  if (attendees.length === 0)
    return (
      <p className="p-4 text-gray-500 dark:text-gray-400">
        No attendees yet.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Attendees
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Ticket Type</Th>
              <Th>Code</Th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Td>{ticket.order.buyerName}</Td>
                <Td>{ticket.order.buyerEmail}</Td>
                <Td>{ticket.order.ticketType.name}</Td>
                <Td>{ticket.code}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left text-sm text-gray-600 dark:text-gray-300">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="border border-gray-200 dark:border-gray-700 p-2 text-sm">
      {children}
    </td>
  );
}
