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
  
  const [form, setForm] = useState<EventPayload>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    published: true,
  });

  const [status, setStatus] = useState<"saving" | "success" | "error" | null>(null);

  useEffect(() => {
    if (event) {
      api
        .get<EventPayload>(`/organizer/events`)
        .then((res) => setForm(res.data))
        .catch(console.error);
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    try {
      if (event) {
        await api.patch(`/organizer/events, form);
      } else {
        await api.post("/organizer/events", form);
      }
      setStatus("success");
      router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{"Create Event"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Event Title"
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />

        <input
          type="datetime-local"
          name="startAt"
          value={form.startAt}
          onChange={handleChange}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />
        <input
          type="datetime-local"
          name="endAt"
          value={form.endAt}
          onChange={handleChange}
          required
          className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          <span>Published</span>
        </label>

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90"
        >
          {status === "saving" ? "Saving..." : "Save Event"}
        </button>
      </form>

      {status === "error" && <p className="text-red-500 mt-2">Failed to save event.</p>}
    </div>
  );
}
