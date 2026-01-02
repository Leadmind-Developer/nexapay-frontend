"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";

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
  const eventId = params.id;

  const [form, setForm] = useState<EventPayload>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    published: false, // SAFER DEFAULT
  });

  const [status, setStatus] = useState<"saving" | "error" | null>(null);

  useEffect(() => {
    if (!eventId) return;

    api
      .get<EventPayload>(`/organizer/events/${eventId}`)
      .then(res => setForm(res.data))
      .catch(console.error);
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, redirect?: string) => {
    e.preventDefault();
    setStatus("saving");

    try {
      if (eventId) {
        await api.patch(`/organizer/events/${eventId}`, form);
      } else {
        const res = await api.post("/organizer/events", form);
        if (redirect) {
          router.push(`/organizer/events/${res.data.id}/${redirect}`);
          return;
        }
      }

      router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {eventId ? "Edit Event" : "Create New Event"}
      </h1>
      <p className="text-gray-500 mb-8">
        Basic information about your event. You’ll add tickets next.
      </p>

      <form className="space-y-10">
        {/* EVENT DETAILS */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>

          <div className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event title (e.g. Lagos Tech Meetup)"
              required
              className="w-full rounded-xl border px-4 py-3"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows={4}
              required
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
        </section>

        {/* SCHEDULE */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Schedule</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              name="startAt"
              value={form.startAt}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="datetime-local"
              name="endAt"
              value={form.endAt}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
          </div>
        </section>

        {/* VISIBILITY */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Visibility</h2>
          <p className="text-sm text-gray-500 mb-4">
            Draft events are hidden from the public.
          </p>

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
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={(e) => handleSubmit(e)}
            disabled={status === "saving"}
            className="flex-1 rounded-xl bg-black text-white py-3 font-medium"
          >
            Save Event
          </button>

          {!eventId && (
            <button
              onClick={(e) => handleSubmit(e, "tickets")}
              disabled={status === "saving"}
              className="flex-1 rounded-xl border py-3 font-medium"
            >
              Save & Add Tickets →
            </button>
          )}
        </div>

        {status === "error" && (
          <p className="text-red-500">Failed to save event.</p>
        )}
      </form>
    </main>
  );
}
