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

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------------- FETCH TICKETS (ORGANIZER) ---------------- */
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
      } else {
        await api.post(
          `/events/organizer/events/${eventId}/tickets`,
          form
        );
        toast.success("Ticket type created");
      }

      resetForm();
      fetchTicketTypes();
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

    // Strip server-controlled fields
    const { id, sold, ...editable } = tt;
    setForm(editable);
    setEditingId(id);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId || !eventId) return;

    try {
      await api.delete(
        `/events/organizer/events/${eventId}/tickets/${deletingId}`
      );
      toast.success("Ticket type deleted");
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete ticket type");
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
          <h1 className="text-2xl font-semibold">Ticket Types</h1>
          <button
            onClick={() => router.push("/organizer/events")}
            className="text-sm underline"
          >
            Back to Events
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl border space-y-4"
        >
          <h2 className="font-medium">
            {editingId ? "Edit Ticket Type" : "Create Ticket Type"}
          </h2>

          <input
            name="name"
            placeholder="Ticket name"
            value={form.name || ""}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description || ""}
            onChange={handleChange}
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price ?? ""}
              onChange={handleChange}
              required
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity ?? ""}
              onChange={handleChange}
              required
              disabled={!!editingId}
            />
            <input
              name="currency"
              value={form.currency || "NGN"}
              disabled
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Ticket"
                : "Create Ticket"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* TABLE (unchanged UI logic) */}
      </div>
    </main>
  );
}
