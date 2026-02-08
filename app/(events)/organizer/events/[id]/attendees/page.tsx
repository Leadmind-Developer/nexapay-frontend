"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 📦 npm install jspdf jspdf-autotable

interface Ticket {
  id: string;
  code: string;
  order: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    ticketType: { name: string };
  };
}

export default function AttendeesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    api
      .get<{ data: Ticket[] }>(`/events/organizer/events/${eventId}/attendees`)
      .then((res) => setAttendees(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  // ---------- CSV Export ----------
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Ticket Type", "Code"];
    const rows = attendees.map(t => [
      t.order.buyerName,
      t.order.buyerEmail,
      `="${t.order.buyerPhone || ""}"`,
      t.order.ticketType.name,
      t.code,
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "attendees.csv");
  };

  // ---------- PDF Export using autoTable ----------
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Attendees List", 14, 15);

    const tableColumn = ["Name", "Email", "Phone", "Ticket Type", "Code"];
    const tableRows = attendees.map(t => [
      t.order.buyerName,
      t.order.buyerEmail,
      t.order.buyerPhone || "-",
      t.order.ticketType.name,
      t.code,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      theme: "grid",
    });

    doc.save("attendees.pdf");
  };

  // ---------- Revoke Ticket ----------
  const revokeTicket = async (code: string) => {
    if (!confirm("Revoke this ticket? This cannot be undone.")) return;
    setRevokingCode(code);

    try {
      await api.post(`/events/tickets/${code}/revoke`);
      setAttendees(prev => prev.filter(ticket => ticket.code !== code));
    } catch (err) {
      alert("Failed to revoke ticket");
    } finally {
      setRevokingCode(null);
    }
  };

  if (loading)
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading attendees…</p>;

  if (attendees.length === 0)
    return (
      <p className="p-4 text-gray-500 dark:text-gray-400">No attendees yet.</p>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Attendees
      </h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Ticket Type</Th>
              <Th>Code</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {attendees.map(ticket => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Td>{ticket.order.buyerName}</Td>
                <Td>{ticket.order.buyerEmail}</Td>
                <Td>{ticket.order.buyerPhone || "-"}</Td>
                <Td>{ticket.order.ticketType.name}</Td>
                <Td>{ticket.code}</Td>
                <Td>
                  <button
                    onClick={() => revokeTicket(ticket.code)}
                    disabled={revokingCode === ticket.code}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {revokingCode === ticket.code ? "Revoking…" : "Revoke"}
                  </button>
                </Td>
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
