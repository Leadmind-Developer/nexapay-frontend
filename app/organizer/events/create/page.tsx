"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type EventType = "PHYSICAL" | "VIRTUAL";
type UploadState = "idle" | "uploading" | "success" | "error";

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
  });

  const [image, setImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>("idle");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------
     Fetch user email
  -------------------------------- */
  useEffect(() => {
    api.get("/user/me").then(res => {
      setForm(prev => ({ ...prev, email: res.data.user.email }));
    });
  }, []);

  const update = (key: keyof EventFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* --------------------------------
     Validation
  -------------------------------- */
  const validationError = useMemo(() => {
    if (!form.title.trim()) return "Event title is required";
    if (!form.email) return "Organizer email missing";
    if (!form.startAt || !form.endAt) return "Start and end date are required";

    if (new Date(form.endAt) <= new Date(form.startAt))
      return "End date must be after start date";

    if (form.type === "PHYSICAL") {
      if (!form.venue.trim()) return "Venue is required for physical events";
      if (!form.address.trim()) return "Address is required for physical events";
    }

    return null;
  }, [form]);

  /* --------------------------------
     Submit
  -------------------------------- */
  const handleSubmit = async (
    publish: boolean,
    redirect?: "tickets"
  ) => {
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      /* -------------------------------
         1️⃣ Create event (JSON)
      ------------------------------- */
      const res = await api.post("/events/organizer/events", {
        title: form.title,
        description: form.description,
        email: form.email,
        type: form.type,
        category: form.category || null,
        venue: form.type === "PHYSICAL" ? form.venue : null,
        address: form.type === "PHYSICAL" ? form.address : null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        published: publish,
      });

      const eventId = res.data.id;

      /* -------------------------------
         2️⃣ Upload image (optional)
      ------------------------------- */
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

      /* -------------------------------
         Redirect
      ------------------------------- */
      if (redirect === "tickets") {
        router.push(`/organizer/events/${eventId}/tickets`);
      } else {
        router.push("/organizer/events");
      }
    } catch (err: any) {
      console.error(err);
      setUploadState("error");
      setError("Failed to create event. Please review your inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-gray-500 mb-8">
          Events are saved as drafts by default.
        </p>

        <Card title="Organizer">
          <Input value={form.email} readOnly />
        </Card>

        <Card title="Event Details">
          <Input
            placeholder="Event title"
            value={form.title}
            onChange={e => update("title", e.target.value)}
          />

          <Textarea
            placeholder="Describe your event"
            value={form.description}
            onChange={e => update("description", e.target.value)}
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
              />
              <Input
                placeholder="Venue address"
                value={form.address}
                onChange={e => update("address", e.target.value)}
              />
            </>
          )}
        </Card>

        <Card title="Event Image">
          <FileInput
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] ?? null)}
          />

          {uploadState !== "idle" && (
            <div className="flex items-center gap-3 mt-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  uploadState === "uploading"
                    ? "bg-amber-400"
                    : uploadState === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-500">
                {uploadState === "uploading" && `Uploading ${uploadProgress}%`}
                {uploadState === "success" && "Image uploaded"}
                {uploadState === "error" && "Upload failed"}
              </span>
            </div>
          )}
        </Card>

        <Card title="Schedule">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              value={form.startAt}
              onChange={e => update("startAt", e.target.value)}
            />
            <Input
              type="datetime-local"
              value={form.endAt}
              onChange={e => update("endAt", e.target.value)}
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

        {error && (
          <p className="text-red-500 mt-4 text-sm">{error}</p>
        )}
      </div>
    </main>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

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
      className="border rounded-xl px-4 py-2 w-full bg-white dark:bg-neutral-800"
    />
  );
}

function Textarea(props: any) {
  return (
    <textarea
      {...props}
      className="border rounded-xl px-4 py-2 w-full bg-white dark:bg-neutral-800"
    />
  );
}

function Select({ options, ...props }: any) {
  return (
    <select
      {...props}
      className="border rounded-xl px-4 py-2 w-full bg-white dark:bg-neutral-800"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function FileInput(props: any) {
  return (
    <input
      {...props}
      type="file"
      className="border rounded-xl px-4 py-2 w-full cursor-pointer"
    />
  );
}

function Button({ variant = "primary", ...props }: any) {
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
