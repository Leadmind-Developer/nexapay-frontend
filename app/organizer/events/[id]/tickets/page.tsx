"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

/* ---------------- TYPES ---------------- */
interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  currency: string;
}

/* ---------------- PAGE ---------------- */
export default function TicketTypesPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [form, setForm] = useState<Partial<TicketType>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------------- FETCH TICKETS ---------------- */
  const fetchTicketTypes = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setTicketTypes(res.data.ticketTypes || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load ticket types");
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchTicketTypes();
  }, [eventId]);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) return toast.error("Event not found");
    setLoading(true);

    try {
      if (editingId) {
        await api.patch(`/events/organizer/events/${eventId}/tickets/${editingId}`, form);
        toast.success("Ticket type updated");
      } else {
        await api.post(`/events/organizer/events/${eventId}/tickets`, form);
        toast.success("Ticket type created");
      }
      resetForm();
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save ticket type");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT / DELETE ---------------- */
  const handleEdit = (tt: TicketType) => {
    if (tt.sold > 0) {
      toast.error("Cannot edit ticket after sales have started");
      return;
    }
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
      await api.delete(`/events/organizer/events/${eventId}/tickets/${deletingId}`);
      toast.success("Ticket type deleted");
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete ticket type");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  if (!eventId) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-red-500 font-medium">
          Event must be created before adding tickets.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Ticket Types
          </h1>
          <button
            onClick={() => router.push(`/organizer/events`)}
            className="text-sm underline text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Back to Events
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm space-y-4"
        >
          <h2 className="font-medium text-gray-800 dark:text-gray-200">
            {editingId ? "Edit Ticket Type" : "Create Ticket Type"}
          </h2>

          <input
            name="name"
            placeholder="Ticket name (e.g. Regular, VIP)"
            value={form.name || ""}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description || ""}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price ?? ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity ?? ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="currency"
              placeholder="Currency"
              value={form.currency || "NGN"}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 font-medium transition"
            >
              {loading ? "Saving..." : editingId ? "Update Ticket" : "Create Ticket"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-400 dark:border-neutral-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* TABLE */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm overflow-x-auto">
          {ticketTypes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No ticket types created yet.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm bg-gray-100 dark:bg-neutral-800">
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Sold</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map(tt => (
                  <tr key={tt.id} className="border-t border-gray-200 dark:border-neutral-700">
                    <td className="p-3 text-gray-900 dark:text-gray-100">{tt.name}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{tt.currency} {tt.price}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{tt.quantity}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{tt.sold}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => handleEdit(tt)}
                        disabled={tt.sold > 0}
                        className="rounded-lg border px-3 py-1 text-sm bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(tt.id)}
                        disabled={tt.sold > 0}
                        className="rounded-lg border px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* DELETE MODAL */}
        {showDeleteModal && deletingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-96 space-y-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Delete Ticket Type</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-gray-400 dark:border-neutral-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition"
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
