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
  const eventId = params?.id as string | undefined;

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [form, setForm] = useState<Partial<TicketType>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Success banner & CTA
  const [successMessage, setSuccessMessage] = useState("");
  const [showCTA, setShowCTA] = useState(false);

  /* ---------------- FETCH TICKETS ---------------- */
  const fetchTicketTypes = async () => {
    if (!eventId) return;

    try {
      const res = await api.get(`/events/organizer/events/${eventId}`);
      setTicketTypes(res.data.ticketTypes || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load ticket types");
    }
  };

  useEffect(() => {
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
        await api.patch(
          `/events/organizer/events/${eventId}/tickets/${editingId}`,
          form
        );
        toast.success("Ticket type updated");
        resetForm();
        fetchTicketTypes();
      } else {
        await api.post(`/events/organizer/events/${eventId}/tickets`, form);
        setSuccessMessage(
          "Ticket type created successfully! You can create multiple types like Regular, VIP, Platinum..."
        );
        setShowCTA(true);
        resetForm();
        fetchTicketTypes();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to save ticket type");
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

    const { id, sold, ...editable } = tt;
    setForm(editable);
    setEditingId(id);
    setSuccessMessage("");
    setShowCTA(false);
  };

  const handleDelete = async (id: string) => {
    if (!eventId) return;
    try {
      await api.delete(`/events/organizer/events/${eventId}/tickets/${id}`);
      toast.success("Ticket type deleted");
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete ticket type");
    }
  };

  /* ---------------- CTA HANDLERS ---------------- */
  const handleCreateAnother = () => {
    resetForm();
    setSuccessMessage("");
    setShowCTA(false);
  };

  const handleBackToEvent = () => {
    router.push("/organizer/events");
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
            onClick={() => router.push("/organizer/events")}
            className="text-sm underline text-gray-700 dark:text-gray-300"
          >
            Back to Events
          </button>
        </div>

        {/* SUCCESS MESSAGE + CTA */}
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded space-y-2">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            {showCTA && (
              <div className="flex gap-3 mt-2 flex-wrap">
                <button
                  onClick={handleCreateAnother}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                >
                  Create Another Ticket Type
                </button>
                <button
                  onClick={handleBackToEvent}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                >
                  Back to Events
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-300 dark:border-neutral-700 space-y-4"
        >
          <h2 className="font-medium text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Ticket Type" : "Create Ticket Type"}
          </h2>

          <input
            name="name"
            placeholder="Ticket name (e.g Regular, VIP, Platinum)"
            value={form.name || ""}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price ?? ""}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity ?? ""}
              onChange={handleChange}
              required
              disabled={!!editingId}
              className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
            <input
              name="currency"
              value={form.currency || "NGN"}
              disabled
              className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Ticket"
                : "Create Ticket"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* TABLE */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-300 dark:border-neutral-700">
          <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">
            Existing Ticket Types
          </h3>
          {ticketTypes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No ticket types yet.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-neutral-700">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Price</th>
                  <th className="py-2 px-2">Quantity</th>
                  <th className="py-2 px-2">Sold</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map(tt => (
                  <tr
                    key={tt.id}
                    className="border-b border-gray-200 dark:border-neutral-800"
                  >
                    <td className="py-2 px-2">{tt.name}</td>
                    <td className="py-2 px-2">
                      {tt.price} {tt.currency}
                    </td>
                    <td className="py-2 px-2">{tt.quantity}</td>
                    <td className="py-2 px-2">{tt.sold}</td>
                    <td className="py-2 px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(tt)}
                        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tt.id)}
                        className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
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
      </div>
    </main>
  );
}
