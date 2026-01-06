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

export default function EventEditPage() {
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

  const [status, setStatus] = useState<"saving" | "error" | null>(null);

  /* ================= FETCH EVENT ================= */
  useEffect(() => {
    if (!eventId) return;

    api
      .get<EventPayload>(`/events/organizer/events/${eventId}`)
      .then((res) => setForm(res.data))
      .catch(console.error);
  }, [eventId]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Save event with explicit published state
   */
  const saveEvent = async (publish: boolean) => {
    if (!eventId) return;
    setStatus("saving");

    try {
      // Only send necessary fields in correct format
      await api.patch(`/events/organizer/events/${eventId}`, {
        title: form.title,
        description: form.description,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        published: publish,
      });

      setForm((prev) => ({ ...prev, published: publish }));
      setStatus(null);
      router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  /**
   * Toggle published from top-bar
   */
  const togglePublish = async () => {
    if (!eventId) return;
    try {
      const newPublished = !form.published;
      await api.patch(`/events/organizer/events/${eventId}`, {
        published: newPublished,
      });
      setForm((prev) => ({ ...prev, published: newPublished }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= RENDER ================= */
  if (!eventId) return <p className="text-red-500">Invalid Event</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* TOP BAR */}
      <OrganizerEventTopBar
        eventId={eventId}
        published={form.published}
        onTogglePublish={togglePublish}
      />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-gray-500 mt-1">
            Update your event details below.
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* EVENT DETAILS */}
          <section className="bg-white dark:bg-neutral-900 border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Event Details</h2>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event title"
              required
              className="w-full rounded-xl border px-4 py-3 dark:bg-neutral-800 focus:outline-none focus:ring"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows={5}
              required
              className="w-full rounded-xl border px-4 py-3 dark:bg-neutral-800 focus:outline-none focus:ring"
            />
          </section>

          {/* SCHEDULE */}
          <section className="bg-white dark:bg-neutral-900 border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Schedule</h2>
            <div className="grid sm:grid-cols-2 gap-4">
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
                  className="w-full rounded-xl border px-4 py-3 dark:bg-neutral-800 focus:outline-none focus:ring"
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
                  className="w-full rounded-xl border px-4 py-3 dark:bg-neutral-800 focus:outline-none focus:ring"
                />
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Status: <strong>{form.published ? "Published" : "Draft"}</strong>
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={status === "saving"}
                onClick={() => saveEvent(false)}
                className="rounded-xl bg-gray-200 px-5 py-3 font-medium dark:bg-neutral-800"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={status === "saving"}
                onClick={() => saveEvent(true)}
                className="rounded-xl bg-black text-white px-5 py-3 font-medium hover:opacity-90"
              >
                Save & Publish
              </button>
            </div>
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
