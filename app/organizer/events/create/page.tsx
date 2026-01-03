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
  email: string;
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
    published: false,
    email: "",
  });

  const [status, setStatus] = useState<"saving" | "error" | null>(null);

  /* ---------------- FETCH USER EMAIL ---------------- */
  useEffect(() => {
    api
      .get("/user/me")
      .then(res => {
        setForm(prev => ({
          ...prev,
          email: res.data.user.email,
        }));
      })
      .catch(console.error);
  }, []);

  /* ---------------- LOAD EVENT (EDIT MODE) ---------------- */
  useEffect(() => {
    if (!eventId) return;

    api
      .get<EventPayload>(`/events/organizer/events/${eventId}`)
      .then(res => setForm(res.data))
      .catch(console.error);
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, redirect?: string) => {
    e.preventDefault();
    setStatus("saving");

    try {
      if (eventId) {
        await api.patch(`/events/organizer/events/${eventId}`, form);
      } else {
        const res = await api.post("/events/organizer/events", form);
        if (redirect) {
          router.push(`/organizer/events/${res.data.id}/${redirect}`);
          return;
        }
      }
      router.push("/organizer/events");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-2">
          {eventId ? "Edit Event" : "Create New Event"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Basic information about your event. You’ll add tickets next.
        </p>

        <form className="space-y-10">
          {/* ORGANIZER */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Organizer</h2>

            <input
              value={form.email}
              readOnly
              className="
                w-full rounded-lg px-4 py-3
                bg-gray-100 text-gray-700
                border border-gray-300
                dark:bg-neutral-800 dark:text-gray-400 dark:border-neutral-700
                cursor-not-allowed
              "
            />
          </section>

          {/* EVENT DETAILS */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>

            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event title"
                required
                className="
                  w-full rounded-lg px-4 py-3
                  bg-white border border-gray-300
                  dark:bg-neutral-800 dark:border-neutral-700
                "
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your event"
                required
                className="
                  w-full rounded-lg px-4 py-3
                  bg-white border border-gray-300
                  dark:bg-neutral-800 dark:border-neutral-700
                "
              />
            </div>
          </section>

          {/* SCHEDULE */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Start date
                </label>
                <input
                  type="datetime-local"
                  name="startAt"
                  value={form.startAt}
                  onChange={handleChange}
                  required
                  className="
                    w-full rounded-lg px-4 py-3
                    bg-white border border-gray-300
                    dark:bg-neutral-800 dark:border-neutral-700
                  "
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  End date
                </label>
                <input
                  type="datetime-local"
                  name="endAt"
                  value={form.endAt}
                  onChange={handleChange}
                  required
                  className="
                    w-full rounded-lg px-4 py-3
                    bg-white border border-gray-300
                    dark:bg-neutral-800 dark:border-neutral-700
                  "
                />
              </div>
            </div>
          </section>

          {/* VISIBILITY */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Visibility</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
              onClick={handleSubmit}
              disabled={status === "saving"}
              className="flex-1 rounded-xl bg-black text-white py-3 font-medium dark:bg-white dark:text-black"
            >
              Save Event
            </button>

            {!eventId && (
              <button
                onClick={(e) => handleSubmit(e, "tickets")}
                disabled={status === "saving"}
                className="flex-1 rounded-xl border border-gray-300 dark:border-neutral-700 py-3 font-medium"
              >
                Save & Add Tickets →
              </button>
            )}
          </div>

          {status === "error" && (
            <p className="text-red-500">Failed to save event.</p>
          )}
        </form>
      </div>
    </main>
  );
}
