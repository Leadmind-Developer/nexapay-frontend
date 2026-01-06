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
    setShowCTA(false);
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return toast.error("Event not found");

    setLoading(true);
    setShowCTA(false);

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
        // Show success message + CTA after creation
        setSuccessMessage(
          "Ticket type created successfully! You can create multiple types like Regular, VIP, Platinum..."
        );
        setShowCTA(true);
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

    const { id, sold, ...editable } = tt;
    setForm(editable);
    setEditingId(id);
    setShowCTA(false);
    setSuccessMessage("");
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
  };

  const handleBackToEvent = () => {
    router.push(`/organizer/events/${eventId}`);
  };

  const handlePublishEvent = async () => {
    try {
      await api.patch(`/events/organizer/events/${eventId}`, { published: true });
      toast.success("Event published successfully!");
      router.push(`/organizer/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to publish event");
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

        {/* SUCCESS MESSAGE + CTA */}
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded space-y-2">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            {showCTA && (
              <div className="flex gap-3 mt-2">
                <button onClick={handleCreateAnother} className="btn">
                  Create Another Ticket Type
                </button>
                <button onClick={handleBackToEvent} className="btn">
                  Back to Event
                </button>
                <button onClick={handlePublishEvent} className="btn btn-primary">
                  Publish Event
                </button>
              </div>
            )}
          </div>
        )}

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
            placeholder="Ticket name (e.g Regular, VIP, Platinum)"
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
            <input name="currency" value={form.currency || "NGN"} disabled />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Ticket"
                : "Create Ticket"}
            </button>

            {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        {/* TABLE */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border">
          <h3 className="font-medium mb-4">Existing Ticket Types</h3>
          {ticketTypes.length === 0 ? (
            <p className="text-gray-500">No ticket types yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Sold</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map(tt => (
                  <tr key={tt.id}>
                    <td>{tt.name}</td>
                    <td>{tt.price} {tt.currency}</td>
                    <td>{tt.quantity}</td>
                    <td>{tt.sold}</td>
                    <td className="flex gap-2">
                      <button onClick={() => handleEdit(tt)}>Edit</button>
                      <button onClick={() => handleDelete(tt.id)}>Delete</button>
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
