"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

type Status = "sending" | "sent" | "error" | null;

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      if (!res.ok) throw new Error("Failed");

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4
      bg-gray-50 dark:bg-gray-900">
      
      <div className="w-full max-w-lg rounded-2xl shadow-lg p-8
        bg-white dark:bg-gray-800">

        <h1 className="text-2xl font-semibold mb-2
          text-gray-900 dark:text-gray-100">
          Contact Us
        </h1>

        <p className="mb-6 text-sm
          text-gray-600 dark:text-gray-400">
          Have a question or need help? Send us a message.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email */}
          {["name", "email"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1
                text-gray-700 dark:text-gray-300 capitalize">
                {field}
              </label>

              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={form[field as keyof ContactForm]}
                onChange={handleChange}
                required
                className="
                  w-full rounded-xl px-4 py-2
                  border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          ))}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1
              text-gray-700 dark:text-gray-300">
              Message
            </label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="
                w-full rounded-xl px-4 py-2
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-900
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="
              w-full rounded-xl py-2 font-medium transition
              bg-blue-600 hover:bg-blue-700
              text-white
              disabled:opacity-60
            "
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Status */}
        {status === "sent" && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            Message sent successfully.
          </p>
        )}

        {status === "error" && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            Failed to send message. Please try again.
          </p>
        )}
      </div>
    </main>
  );
}
