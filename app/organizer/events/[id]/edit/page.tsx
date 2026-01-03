"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import OrganizerEventTopBar from "@/components/OrganizerEventTopBar";

interface EventPayload {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  published: boolean;
}

export default function EventFormPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string | undefined;

  const [form, setForm] = useState<EventPayload>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    published: false,
  });

  const [status, setStatus] = useState<
    "saving" | "success" | "error" | null
  >(null);

  /* ================= FETCH EVENT ================= */
  useEffect(() => {
    if (!eventId) return;

    api
      .get<EventPayload>(`/organizer/events/${eventId}`)
      .then((res) => setForm(res.data))
      .catch(console.error);
  }, [eventId]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    try {
      if (eventId) {
        await api.patch(`/events/organizer/events/${eventId}`, form);
      } else {
        await api.post("/events/organizer/events", form);
      }

      setStatus("success");
      router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <OrganizerEventTopBar
        eventId={eventId}
        published={form.published}
        onTogglePublish={() =>
          setForm((prev) => ({ ...prev, published: !prev.published }))
        }
      />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {eventId ? "Edit Event" : "Create Event"}
          </h1>
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

          {/* ACTIONS */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Status:{" "}
              <strong>
                {form.published ? "Published" : "Draft"}
              </strong>
            </span>

            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-xl bg-black text-white px-6 py-3 font-medium hover:opacity-90"
            >
              {status === "saving" ? "Saving..." : "Save Event"}
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
