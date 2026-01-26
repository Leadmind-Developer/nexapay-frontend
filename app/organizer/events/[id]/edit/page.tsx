"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import OrganizerEventTopBar from "@/components/OrganizerEventTopBar";
import { getEventImage } from "@/lib/getEventImage";

/* =====================================================
   Types (MATCH BACKEND)
===================================================== */

type UploadState = "idle" | "uploading" | "success" | "error";

type EventType = "PHYSICAL" | "VIRTUAL";

type EventCategory =
  | "ENTERTAINMENT"
  | "FOOD_AND_DRINK"
  | "CAREER_AND_BUSINESS"
  | "SPIRITUALITY_AND_RELIGION"
  | "ART_AND_CULTURE"
  | "COMMUNITY"
  | "OTHER";

interface EditEventFormState {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  published: boolean;
  email: string;

  type: EventType;
  category: EventCategory;

  venue?: string;
  address?: string;
}

/* =====================================================
   Edit Page
===================================================== */

export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string | undefined;

  const [form, setForm] = useState<EditEventFormState | null>(null);
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

    (async () => {
      try {
        const res = await api.get(`/events/organizer/events/${eventId}`);
        const data = res.data;

        setForm({
          title: data.title,
          description: data.description ?? "",
          email: data.email,

          startAt: data.startAt?.slice(0, 16) ?? "",
          endAt: data.endAt?.slice(0, 16) ?? "",
          published: Boolean(data.published),

          type: data.type ?? "PHYSICAL",
          category: data.category ?? "OTHER",

          venue: data.venue ?? "",
          address: data.address ?? "",
        });

        const imageUrl = getEventImage(data);
        if (imageUrl) setPreview(imageUrl);
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setFormError("Failed to load event data.");
      }
    })();
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
     Form helper
  ------------------------------ */

  const update = <K extends keyof EditEventFormState>(
    key: K,
    value: EditEventFormState[K]
  ) => {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  /* ------------------------------
     Save / Publish
  ------------------------------ */

  const saveEvent = async (publish?: boolean, redirect = true) => {
    if (!form || !eventId) return;

    setFormError(null);

    // Validation (same logic backend expects)
    if (!form.title || !form.startAt || !form.endAt) {
      setFormError("Title, start date, and end date are required.");
      return;
    }

    if (new Date(form.endAt) <= new Date(form.startAt)) {
      setFormError("End date must be after start date.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        email: form.email,

        type: form.type,
        category: form.category,

        venue: form.type === "PHYSICAL" ? form.venue : null,
        address: form.type === "PHYSICAL" ? form.address : null,

        startAt: form.startAt,
        endAt: form.endAt,

        published: publish ?? form.published,
      };

      console.log("PATCH payload →", payload);

      await api.patch(`/events/organizer/events/${eventId}`, payload);

      setForm(prev =>
        prev ? { ...prev, published: publish ?? prev.published } : prev
      );

      /* -------- Upload image (separate endpoint) -------- */

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

      if (redirect) router.push("/organizer/events");
    } catch (err: any) {
      console.error("Save failed:", err.response?.data || err);
      setFormError(err.response?.data?.error || "Failed to save event.");
      setUploadState("error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!form) return;
    await saveEvent(!form.published, false);
  };

  /* =====================================================
     Render
  ===================================================== */

  if (!eventId) return <p className="text-red-500">Invalid event</p>;
  if (!form) return <p className="text-gray-500">Loading event...</p>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-6">

        <OrganizerEventTopBar
          eventId={eventId}
          published={form.published}
          onTogglePublish={togglePublish}
        />

        <h1 className="text-3xl font-bold mt-6 mb-2">Edit Event</h1>
        <p className="text-gray-500 mb-8">
          Changes are saved as drafts until published.
        </p>

        {formError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* ================= DETAILS ================= */}

        <Card title="Event Details">
          <Input
            placeholder="Event title"
            value={form.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
               update("title", e.target.value)
            }
          />

          <Textarea
            placeholder="Describe your event"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
               update("description", e.target.value)  
            }
          />
        </Card>

        {/* ================= IMAGE ================= */}

        <Card title="Event Image">
          {!preview ? (
            <FileInput
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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

        {/* ================= SCHEDULE ================= */}

        <Card title="Schedule">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              value={form.startAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                 update("startAt", e.target.value)
               }
            />
            <Input
              type="datetime-local"
              value={form.endAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update("endAt", e.target.value)
               }
            />
          </div>
        </Card>

        {/* ================= ACTIONS ================= */}

        <Card title="Actions">
          <div className="flex gap-3 flex-col md:flex-row">

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

        <EventPreview form={form} previewImage={preview} />

      </div>
    </main>
  );
}

/* =====================================================
   Preview
===================================================== */

function EventPreview({
  form,
  previewImage,
}: {
  form: EditEventFormState;
  previewImage?: string | null;
}) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 border shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        Event Preview
      </h2>

      <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-4">

        {previewImage ? (
          <Image
            src={previewImage}
            alt={form.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

      </div>

      <h3 className="text-xl font-bold mb-2">
        {form.title}
      </h3>

      <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
        {form.description || "No description yet."}
      </p>

      <p className="text-sm text-gray-500 mb-1">
        {new Date(form.startAt).toLocaleString()} —{" "}
        {new Date(form.endAt).toLocaleString()}
      </p>

      {form.type === "PHYSICAL" && form.venue && (
        <p className="text-sm text-gray-500">
          {form.venue} {form.address && `(${form.address})`}
        </p>
      )}

      {form.type === "VIRTUAL" && (
        <p className="text-sm text-gray-500">Virtual Event</p>
      )}

      <p className="text-sm text-gray-500 mt-1">
        Organizer: {form.email}
      </p>

    </section>
  );
}

/* =====================================================
   UI helpers
===================================================== */

function Card({ title, children }: any) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow border">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-neutral-800"
    />
  );
}

function Textarea(props: any) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-neutral-800"
    />
  );
}

function FileInput(props: any) {
  return (
    <input
      {...props}
      type="file"
      className="w-full rounded-xl border px-4 py-2 cursor-pointer"
    />
  );
}

function Button({
  variant = "primary",
  ...props
}: any) {
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
