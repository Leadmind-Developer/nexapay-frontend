"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type EventType = "PHYSICAL" | "VIRTUAL";

interface EventFormState {
  title: string;
  description: string;
  email: string;
  type: EventType;
  venue: string;
  address: string;
  category: string;
  startAt: string;
  endAt: string;
  published: boolean;
  image: File | null;
}

export default function EventCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<EventFormState>({
    title: "",
    description: "",
    email: "",
    type: "PHYSICAL",
    venue: "",
    address: "",
    category: "",
    startAt: "",
    endAt: "",
    published: false,
    image: null,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  // Fetch user email
  useEffect(() => {
    api
      .get("/user/me")
      .then(res => setForm(prev => ({ ...prev, email: res.data.user.email })))
      .catch(console.error);
  }, []);

  const update = (key: keyof EventFormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (publish: boolean, redirect?: "tickets") => {
    setStatus("saving");
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("email", form.email);
      body.append("type", form.type);
      body.append("category", form.category);
      body.append("startAt", new Date(form.startAt).toISOString());
      body.append("endAt", new Date(form.endAt).toISOString());
      body.append("published", String(publish));
      if (form.type === "PHYSICAL") {
        body.append("venue", form.venue);
        body.append("address", form.address);
      }
      if (form.image) body.append("image", form.image);

      const res = await api.post("/events/organizer/events", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("idle");
      const eventId = res.data.id;
      if (redirect === "tickets") router.push(`/organizer/events/${eventId}/tickets`);
      else router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-gray-500 mb-8">
          Events are saved as drafts by default. You can publish anytime.
        </p>

        {/* Organizer Section */}
        <Card title="Organizer">
          <input
            readOnly
            value={form.email}
            className="input input-disabled w-full"
          />
        </Card>

        {/* Event Details */}
        <Card title="Event Details">
          <input
            className="input w-full"
            placeholder="Event title"
            value={form.title}
            onChange={e => update("title", e.target.value)}
            required
          />
          <textarea
            className="input w-full"
            rows={4}
            placeholder="Describe your event"
            value={form.description}
            onChange={e => update("description", e.target.value)}
          />
          <select
            className="input w-full"
            value={form.type}
            onChange={e => update("type", e.target.value as EventType)}
          >
            <option value="PHYSICAL">Physical Event</option>
            <option value="VIRTUAL">Virtual Event</option>
          </select>
          {form.type === "PHYSICAL" && (
            <>
              <input
                className="input w-full"
                placeholder="Venue name"
                value={form.venue}
                onChange={e => update("venue", e.target.value)}
              />
              <input
                className="input w-full"
                placeholder="Venue address"
                value={form.address}
                onChange={e => update("address", e.target.value)}
              />
            </>
          )}
        </Card>

        {/* Image */}
        <Card title="Event Image">
          <input
            type="file"
            accept="image/*"
            onChange={e => update("image", e.target.files?.[0] ?? null)}
            className="file-input w-full"
          />
          <p className="text-gray-400 text-sm mt-1">Recommended size: 1200×630</p>
        </Card>

        {/* Schedule */}
        <Card title="Schedule">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              className="input w-full"
              value={form.startAt}
              onChange={e => update("startAt", e.target.value)}
            />
            <input
              type="datetime-local"
              className="input w-full"
              value={form.endAt}
              onChange={e => update("endAt", e.target.value)}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button
            disabled={status === "saving"}
            onClick={() => handleSubmit(false)}
            className="btn-secondary"
          >
            Save Draft
          </button>
          <button
            disabled={status === "saving"}
            onClick={() => handleSubmit(true)}
            className="btn-primary"
          >
            Save & Publish
          </button>
          <button
            disabled={status === "saving"}
            onClick={() => handleSubmit(false, "tickets")}
            className="btn-outline"
          >
            Save & Add Tickets →
          </button>
        </div>

        {status === "error" && (
          <p className="text-red-500 mt-4">
            Failed to create event. Please check your inputs.
          </p>
        )}
      </div>
    </main>
  );
}

/* ===================== */
/* ===== COMPONENTS ==== */
/* ===================== */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-md border border-gray-200 dark:border-neutral-700">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/* ===================== */
/* ===== INPUT STYLES === */
/* ===================== */

const baseInput = "border rounded-xl px-4 py-2 focus:outline-none focus:ring w-full dark:bg-neutral-800 dark:text-white dark:border-neutral-700";

const input = `${baseInput} bg-white text-gray-800`;
const disabled = `${baseInput} bg-gray-100 cursor-not-allowed`;
const fileInput = `${baseInput} cursor-pointer`;

export const classNames = { input, disabled, fileInput };
