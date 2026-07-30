"use client";

import { useState } from "react";

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", mobile: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setStatus("sent");
      setValues({ name: "", email: "", mobile: "", message: "" });
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-success">Thanks for reaching out — we&apos;ll get back to you soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        required
        placeholder="Name"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        className="rounded border border-border px-3 py-2"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        className="rounded border border-border px-3 py-2"
      />
      <input
        placeholder="Mobile number"
        value={values.mobile}
        onChange={(e) => setValues((v) => ({ ...v, mobile: e.target.value }))}
        className="rounded border border-border px-3 py-2"
      />
      <textarea
        required
        placeholder="Message"
        rows={4}
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        className="rounded border border-border px-3 py-2"
      />
      {status === "error" && <p className="text-sm text-error">Something went wrong — please try again.</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-btn px-5 py-2.5 text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
