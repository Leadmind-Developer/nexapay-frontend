"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OrganizerEventTopBar from "@/components/OrganizerEventTopBar";

interface EventPayload {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  published: boolean;
}

export default function EventCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<EventPayload>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    published: false,
  });

  const [status, setStatus] = useState<"saving" | "error" | null>(null);
  const [newEventId, setNewEventId] = useState<string | null>(null);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, redirectTickets?: boolean) => {
    e.preventDefault();
    setStatus("saving");

    try {
      // Convert datetime-local to ISO
      const payload = {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      };

      const res = await api.post("/events/organizer/events", payload);
      const createdId = res.data.id;
      setNewEventId(createdId);

      setStatus(null);

      if (redirectTickets) {
        // redirect immediately to tickets page after creation
        router.push(`/organizer/events/${createdId}/tickets`);
        return;
      }

      router.push("/organizer/events");
    } catch (err) {
      console.error("Failed to create event:", err);
      setStatus("error");
    }
  };

  const effectiveEventId = newEventId;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <OrganizerEventTopBar
        eventId={effectiveEventId}
        published={form.published}
        onTogglePublish={() =>
          setForm(prev => ({ ...prev, published: !prev.published }))
        }
      />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to get your event ready.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* EVENT DETAILS */}
          <section className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event title"
                required
                className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event"
                rows={5}
                required
                className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring"
              />
            </div>
          </section>

          {/* SCHEDULE */}
          <section className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Schedule</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startAt"
                  value={form.startAt}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endAt"
                  value={form.endAt}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring"
                />
              </div>
            </div>
          </section>

          {/* PUBLISH */}
          <section className="bg-white border rounded-xl p-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
              />
              <span>Publish event</span>
            </label>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-xl bg-black text-white px-6 py-3 font-medium hover:opacity-90 flex-1"
            >
              {status === "saving" ? "Saving..." : "Save Event"}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={status === "saving"}
              className="rounded-xl border border-gray-300 px-6 py-3 font-medium hover:opacity-90 flex-1"
            >
              Save & Add Tickets →
            </button>
          </div>

          {status === "error" && (
            <p className="text-red-500 text-sm">
              Failed to save event. Please try again.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
