"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

type Status = "sending" | "sent" | "error" | null;

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-6">Have a question or need help? Send us a message.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "email"].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">{field}</label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={form[field as keyof ContactForm]}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-black text-white py-2 font-medium hover:opacity-90"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status === "sent" && <p className="mt-4 text-green-600 text-sm">Message sent successfully.</p>}
        {status === "error" && <p className="mt-4 text-red-600 text-sm">Failed to send message.</p>}
      </div>
    </main>
  );
}
