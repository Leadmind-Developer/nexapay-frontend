"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { z } from "zod";

/* =====================================================
   Types
===================================================== */

type EventType = "PHYSICAL" | "VIRTUAL";
type UploadState = "idle" | "uploading" | "success" | "error";

/* =====================================================
   Zod Schema (Single Source of Truth)
===================================================== */

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  email: z.string().email(),
  type: z.enum(["PHYSICAL", "VIRTUAL"]),
  venue: z.string().optional(),
  address: z.string().optional(),

  city: z.string().optional(),
  country: z.string().optional(),

  category: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
})
  .refine(data => new Date(data.endAt) > new Date(data.startAt), {
    message: "End date must be after start date",
    path: ["endAt"],
  })
  .refine(
    data =>
      data.type === "VIRTUAL" ||
      (!!data.venue?.trim() && !!data.address?.trim()),
    {
      message: "Venue and address are required for physical events",
      path: ["address"],
    }
  );

type EventFormState = z.infer<typeof eventSchema>;
type FormErrors = Partial<Record<keyof EventFormState, string>>;

const EVENT_CATEGORIES = [
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Food & Drink", value: "FOOD_AND_DRINK" },
  { label: "Career & Business", value: "CAREER_AND_BUSINESS" },
  { label: "Spirituality & Religion", value: "SPIRITUALITY_AND_RELIGION" },
  { label: "Art & Culture", value: "ART_AND_CULTURE" },
  { label: "Community", value: "COMMUNITY" },
  { label: "Other", value: "OTHER" },
];

/* =====================================================
   Page
===================================================== */

export default function EventCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<EventFormState>({
    title: "",
    description: "",
    email: "",
    type: "PHYSICAL",
    venue: "",
    address: "",
    "city": "Lagos",
    "country": "Nigeria",
    category: "",
    startAt: "",
    endAt: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [saving, setSaving] = useState(false);

  /* --------------------------------
     Fetch organizer email
  -------------------------------- */
  useEffect(() => {
    api.get("/user/me").then(res => {
      setForm(prev => ({ ...prev, email: res.data.user.email }));
    });
  }, []);

  /* --------------------------------
     Image preview lifecycle
  -------------------------------- */
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* --------------------------------
     Helpers
  -------------------------------- */
  const update = (key: keyof EventFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
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

  /* --------------------------------
     Submit
  -------------------------------- */
  const handleSubmit = async (
    publish: boolean,
    redirect?: "tickets"
  ) => {
    if (!validate()) return;

    // 🔑 Save & Add Tickets MUST publish
    const shouldPublish = redirect === "tickets" ? true : publish;

    setSaving(true);
    setFormError(null);

    try {
      /* 1️⃣ Create event */
      const res = await api.post("/events/organizer/events", {
        ...form,
        venue: form.type === "PHYSICAL" ? form.venue : null,
        address: form.type === "PHYSICAL" ? form.address : null,
        city: form.type === "PHYSICAL" ? form.city : null,
        country: form.type === "PHYSICAL" ? form.country : null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        published: shouldPublish,
      });

      const eventId = res.data.id;

      /* 2️⃣ Upload image */
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

      /* 3️⃣ Redirect */
      router.push(
        redirect === "tickets"
          ? `/organizer/events/${eventId}/tickets`
          : "/organizer/events"
      );
    } catch (err) {
      console.error(err);
      setUploadState("error");
      setFormError("Failed to create event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     Render
  ===================================================== */

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-gray-500 mb-8">
          Events are saved as drafts by default.
        </p>

        {formError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Card title="Organizer">
          <Input value={form.email} readOnly />
        </Card>

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
           
           <Select
              value={form.category}
              onChange={e => update("category", e.target.value)}
              options={[
                 { label: "Select category", value: "" },
                 ...EVENT_CATEGORIES,
               ]}
              />           

          <Select
            value={form.type}
            onChange={e => update("type", e.target.value as EventType)}
            options={[
              { label: "Physical Event", value: "PHYSICAL" },
              { label: "Virtual Event", value: "VIRTUAL" },
            ]}
          />

          {form.type === "PHYSICAL" && (
            <>
              <Input
                placeholder="Venue name"
                value={form.venue}
                onChange={e => update("venue", e.target.value)}
                error={errors.venue}
              />
              <Input
                placeholder="Venue address"
                value={form.address}
                onChange={e => update("address", e.target.value)}
                error={errors.address}
              />
            <Input
      placeholder="City"
      value={form.city}
      onChange={e => update("city", e.target.value)}
      error={errors.city}
    />
    <Input
      placeholder="Country"
      value={form.country}
      onChange={e => update("country", e.target.value)}
      error={errors.country}
    />
  </>
)}
        </Card>

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
                onClick={() => setImage(null)}
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

        <Card title="Actions">
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => handleSubmit(false)}
            >
              Save Draft
            </Button>
            <Button
              disabled={saving}
              onClick={() => handleSubmit(true)}
            >
              Save & Publish
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => handleSubmit(false, "tickets")}
            >
              Save & Add Tickets →
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
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
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
        <p className="text-xs text-red-500 mt-1">{error}</p>
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

function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { label: string; value: string }[];
}) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-neutral-800"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
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
