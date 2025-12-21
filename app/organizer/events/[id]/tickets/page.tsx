"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api, { Payload } from "@/lib/api";
import { AxiosResponse } from "axios";
import toast from "react-hot-toast";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Props {
  eventId: string;
}

export default function TicketTypesPage({ eventId }: Props) {
  const router = useRouter();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [form, setForm] = useState<Partial<TicketType>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // ID of ticket being deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchTicketTypes = async () => {
    try {
      const res: AxiosResponse<TicketType[]> = await api.get(`/organizer/events/${eventId}`);
      setTicketTypes(res.data.ticketTypes || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load ticket types");
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.patch(`/ticket-types/${editingId}`, form as Payload);
        toast.success("Ticket type updated");
      } else {
        await api.post(`/organizer/events/${eventId}/tickets`, form as Payload);
        toast.success("Ticket type created");
      }
      setForm({});
      setEditingId(null);
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save ticket type");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tt: TicketType) => {
    setForm(tt);
    setEditingId(tt.id);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/ticket-types/${deletingId}`);
      toast.success("Ticket type deleted");
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete ticket type");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Manage Ticket Types</h1>

      {/* Ticket Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-medium">{editingId ? "Edit Ticket Type" : "Create Ticket Type"}</h2>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            name="price"
            type="number"
            value={form.price || ""}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            name="quantity"
            type="number"
            value={form.quantity || ""}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90"
        >
          {loading ? "Saving..." : editingId ? "Update Ticket Type" : "Create Ticket Type"}
        </button>
      </form>

      {/* Ticket Type List */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4 relative">
        <h2 className="text-lg font-medium mb-4">Existing Ticket Types</h2>
        {ticketTypes.length === 0 && <p className="text-gray-500">No ticket types yet.</p>}
        <ul className="space-y-2">
          {ticketTypes.map((tt) => (
            <li key={tt.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-medium">{tt.name}</span> — ${tt.price} | Qty: {tt.quantity} | Sold: {tt.sold}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(tt)}
                  className="px-3 py-1 bg-yellow-400 text-black rounded-xl hover:opacity-90"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(tt.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-xl hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Inline Modal */}
        {showDeleteModal && deletingId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-96 space-y-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <p>Are you sure you want to delete this ticket type? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

          ))}
        </tbody>
      </table>
    </div>
  );
}
