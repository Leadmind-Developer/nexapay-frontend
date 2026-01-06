"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import OrganizerEventTopBar from "@/components/OrganizerEventTopBar";
import { z } from "zod";

/* =====================================================
   Types
===================================================== */

type EventType = "PHYSICAL" | "VIRTUAL";
type UploadState = "idle" | "uploading" | "success" | "error";

/* =====================================================
   Shared Schema (SAME AS CREATE)
===================================================== */

const eventSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().optional(),
    email: z.string().email(),
    type: z.enum(["PHYSICAL", "VIRTUAL"]),
    venue: z.string().optional(),
    address: z.string().optional(),
    category: z.string().optional(),
    startAt: z.string().min(1),
    endAt: z.string().min(1),
    published: z.boolean(),
  })
  .refine(
    data => new Date(data.endAt) > new Date(data.startAt),
    { path: ["endAt"], message: "End date must be after start date" }
  )
  .refine(
    data =>
      data.type === "VIRTUAL" ||
      (!!data.venue?.trim() && !!data.address?.trim()),
    {
      path: ["venue"],
      message: "Venue and address are required for physical events",
    }
  );

type EventFormState = z.infer<typeof eventSchema>;
type FormErrors = Partial<Record<keyof EventFormState, string>>;

/* =====================================================
   Page
===================================================== */

export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [form, setForm] = useState<EventFormState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");

  /* =====================================================
     Fetch Event (NORMALIZED)
  ===================================================== */

  useEffect(() => {
    if (!eventId) return;

    api.get(`/events/organizer/events/${eventId}`).then(res => {
      const e = res.data;

      setForm({
        title: e.title,
        description: e.description ?? "",
        email: e.email,
        type: e.type,
        venue: e.venue ?? "",
        address: e.address ?? "",
        category: e.category ?? "",
        startAt: e.startAt.slice(0, 16),
        endAt: e.endAt.slice(0, 16),
        published: Boolean(e.published),
      });
    });
  }, [eventId]);

  /* =====================================================
     Helpers
  ===================================================== */

  const update = (key: keyof EventFormState, value: any) => {
    setForm(prev => prev && { ...prev, [key]: value });
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    if (!form) return false;

    const result = eventSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      setFormError(null);
      return true;
    }

    const fieldErrors: FormErrors = {};
    result.error.issues.forEach(issue => {
      const key = issue.path[0] as keyof EventFormState;
      fieldErrors[key] = issue.message;
    });

    setErrors(fieldErrors);
    setFormError("Please fix the errors below.");
    return false;
  };

  /* =====================================================
     Save / Publish (REAL)
  ===================================================== */

  const saveEvent = async (publish?: boolean) => {
    if (!form || !validate()) return;

    setSaving(true);
    setFormError(null);

    try {
      await api.patch(`/events/organizer/events/${eventId}`, {
        ...form,
        published: publish ?? form.published,
        venue: form.type === "PHYSICAL" ? form.venue : null,
        address: form.type === "PHYSICAL" ? form.address : null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });

      if (image) {
        setUploadState("uploading");
        const fd = new FormData();
        fd.append("images", image);
        await api.post(
          `/events/organizer/events/${eventId}/images`,
          fd
        );
        setUploadState("success");
      }

      router.push("/organizer/events");
    } catch (err) {
      console.error(err);
      setFormError("Failed to save event.");
      setUploadState("error");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     Render
  ===================================================== */

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizerEventTopBar
        eventId={eventId}
        published={form.published}
        onTogglePublish={() => saveEvent(!form.published)}
      />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Edit Event</h1>

        {formError && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 text-red-700">
            {formError}
          </div>
        )}

        {/* Event Details */}
        <section className="bg-white p-6 rounded-xl space-y-4 mb-6">
          <input
            value={form.title}
            onChange={e => update("title", e.target.value)}
            placeholder="Event title"
          />

          <textarea
            value={form.description}
            onChange={e => update("description", e.target.value)}
          />
        </section>

        {/* Schedule */}
        <section className="bg-white p-6 rounded-xl mb-6 grid md:grid-cols-2 gap-4">
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={e => update("startAt", e.target.value)}
          />
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={e => update("endAt", e.target.value)}
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            disabled={saving}
            onClick={() => saveEvent(false)}
          >
            Save Draft
          </button>

          <button
            disabled={saving}
            onClick={() => saveEvent(true)}
          >
            Save & Publish
          </button>
        </div>
      </main>
    </div>
  );
}
