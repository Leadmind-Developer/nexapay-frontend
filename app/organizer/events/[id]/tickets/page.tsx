"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold?: number;
}

export default function TicketTypesPage() {
  const params = useParams();
  const eventId = params.id;

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<TicketType, "id" | "sold">>({ name: "", price: 0, quantity: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"saving" | "success" | "error" | null>(null);

  // Load ticket types
  useEffect(() => {
    api
      .get<TicketType[]>(`/organizer/events/${eventId}`)
      .then((res) => {
        // Extract ticketTypes
        setTickets(res.data.ticketTypes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" || name === "quantity" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    try {
      if (editingId) {
        // PATCH/update ticket type (optional: backend route needed)
        await api.patch(`/ticket-types/${editingId}`, form);
        setTickets((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...form } : t))
        );
      } else {
        const res = await api.post(`/organizer/events/${eventId}/tickets`, form);
        setTickets((prev) => [...prev, res.data]);
      }

      setForm({ name: "", price: 0, quantity: 0 });
      setEditingId(null);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleEdit = (ticket: TicketType) => {
    setForm({ name: ticket.name, price: ticket.price, quantity: ticket.quantity });
    setEditingId(ticket.id);
  };

  if (loading) return <p className="p-4">Loading ticket types...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ticket Types</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div className="flex gap-2">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ticket Name"
            required
            className="flex-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            required
            className="w-24 rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
            className="w-24 rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
          <button
            type="submit"
            disabled={status === "saving"}
            className="bg-black text-white px-4 py-2 rounded-xl hover:opacity-90"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>
        {status === "error" && <p className="text-red-500 text-sm">Failed to save ticket type.</p>}
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Sold</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="border p-2">{ticket.name}</td>
              <td className="border p-2">₦{ticket.price}</td>
              <td className="border p-2">{ticket.quantity}</td>
              <td className="border p-2">{ticket.sold || 0}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(ticket)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
