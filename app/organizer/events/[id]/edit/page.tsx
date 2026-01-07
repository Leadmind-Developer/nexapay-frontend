"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { z } from "zod";
import OrganizerEventTopBar from "@/components/OrganizerEventTopBar";
import { getEventImage } from "@/lib/getEventImage";

/* =====================================================
   Types
===================================================== */

type EventType = "PHYSICAL" | "VIRTUAL";
type UploadState = "idle" | "uploading" | "success" | "error";

/* =====================================================
   EDIT Schema (IMPORTANT: NOT CREATE SCHEMA)
===================================================== */

const editEventSchema = z
  .object({
    title: z.string().min(3, "Event title is required"),
    description: z.string().optional(),
    startAt: z.string().min(1, "Start date is required"),
    endAt: z.string().min(1, "End date is required"),
    published: z.boolean(),
  })
  .refine(
    data => new Date(data.endAt) > new Date(data.startAt),
    { message: "End date must be after start date", path: ["endAt"] }
  );

type EditEventFormState = z.infer<typeof editEventSchema> & {
  email: string;
  type: EventType;
  venue?: string;
  address?: string;
  category?: string;
};

type FormErrors = Partial<Record<keyof EditEventFormState, string>>;

/* =====================================================
   Edit Page
===================================================== */

export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string | undefined;

  const [form, setForm] = useState<EditEventFormState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  /* ------------------------------
     Fetch existing event
  ------------------------------ */
  useEffect(() => {
    if (!eventId) return;

    api.get(`/events/organizer/events/${eventId}`).then(res => {
      const data = res.data;

      setForm({
        title: data.title,
        description: data.description ?? "",
        email: data.email,
        type: data.type,
        venue: data.venue ?? "",
        address: data.address ?? "",
        category: data.category ?? "",
        startAt: data.startAt?.slice(0, 16) ?? "",
        endAt: data.endAt?.slice(0, 16) ?? "",
        published: Boolean(data.published),
      });

      const imageUrl = getEventImage(data);
       if (imageUrl) setPreview(imageUrl);
    });
  }, [eventId]);

  /* ------------------------------
     Image preview lifecycle
  ------------------------------ */
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* ------------------------------
     Helpers
  ------------------------------ */
  const update = (key: keyof EditEventFormState, value: any) => {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    if (!form) return false;

    const result = editEventSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      setFormError(null);
      return true;
    }

    const fieldErrors: FormErrors = {};
    result.error.issues.forEach(issue => {
      const key = issue.path[0] as keyof EditEventFormState;
      fieldErrors[key] = issue.message;
    });

    setErrors(fieldErrors);
    setFormError("Please fix the errors below.");
    return false;
  };

  /* ------------------------------
     Save / Publish
  ------------------------------ */
  const saveEvent = async (
    publish?: boolean,
    redirect: boolean = true
  ) => {
    if (!form || !eventId) return;
    if (!validate()) return;

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

      setForm(prev =>
        prev
          ? { ...prev, published: publish ?? prev.published }
          : prev
      );

      if (image) {
        setUploadState("uploading");
        const fd = new FormData();
        fd.append("images", image);

        await api.post(
          `/events/organizer/events/${eventId}/images`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: e => {
              if (e.total) {
                setUploadProgress(
                  Math.round((e.loaded / e.total) * 100)
                );
              }
            },
          }
        );

        setUploadState("success");
      }

      if (redirect) {
        router.push("/organizer/events");
      }
    } catch (err: any) {
      console.error(err);
      setFormError("Failed to save event. Please try again.");
      setUploadState("error");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------
     Toggle published (TOP BAR)
  ------------------------------ */
  const togglePublish = async () => {
    if (!form) return;
    await saveEvent(!form.published, false);
  };

  /* =====================================================
     Render
  ===================================================== */

  if (!form) return null;
  if (!eventId) return <p className="text-red-500">Invalid Event</p>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <OrganizerEventTopBar
          eventId={eventId}
          published={form.published}
          onTogglePublish={togglePublish}
        />

        <h1 className="text-3xl font-bold mb-2 mt-6">Edit Event</h1>
        <p className="text-gray-500 mb-8">
          Changes are saved as drafts until published.
        </p>

        {formError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* Event Details */}
        <Card title="Event Details">
          <Input
            placeholder="Event title"
            value={form.title}
            onChange={e => update("title", e.target.value)}
            error={errors.title}
          />
          <Textarea
            placeholder="Describe your event"
            value={form.description}
            onChange={e => update("description", e.target.value)}
          />
        </Card>

        {/* Event Image */}
        <Card title="Event Image">
          {!preview ? (
            <FileInput
              accept="image/*"
              onChange={e =>
                setImage(e.target.files?.[0] ?? null)
              }
            />
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={preview}
                className="h-20 w-20 rounded-lg object-cover border"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
              >
                Remove
              </Button>
            </div>
          )}
          {uploadState === "uploading" && (
            <p className="text-sm text-gray-500">
              Uploading… {uploadProgress}%
            </p>
          )}
        </Card>

        {/* Schedule */}
        <Card title="Schedule">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              value={form.startAt}
              onChange={e => update("startAt", e.target.value)}
              error={errors.startAt}
            />
            <Input
              type="datetime-local"
              value={form.endAt}
              onChange={e => update("endAt", e.target.value)}
              error={errors.endAt}
            />
          </div>
        </Card>

        {/* Actions */}
        <Card title="Actions">
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => saveEvent(false)}
            >
              Save Draft
            </Button>
            <Button
              disabled={saving}
              onClick={() => saveEvent(true)}
            >
              Save & Publish
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

/* =====================================================
   UI Components
===================================================== */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow border">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </section>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
}) {
  return (
    <div>
      <input
        {...props}
        className={`w-full rounded-xl border px-4 py-2 bg-white dark:bg-neutral-800 ${
          error ? "border-red-400" : ""
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-neutral-800"
    />
  );
}

function FileInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      type="file"
      className="w-full cursor-pointer rounded-xl border px-4 py-2"
    />
  );
}

function Button({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
}) {
  const styles =
    variant === "primary"
      ? "bg-black text-white"
      : variant === "secondary"
      ? "bg-gray-200"
      : "border";

  return (
    <button
      {...props}
      className={`rounded-xl px-5 py-2 ${styles}`}
    />
  );
}
