"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

export default function TailorSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/tailor/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not submit request");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthLayout title="Request Submitted">
        <p className="text-center text-sm text-ink-secondary">
          Thanks, {name}. Your tailor account request has been sent to the admin for approval.
          You&apos;ll be able to log in at{" "}
          <Link href="/tailor/login" className="text-accent hover:underline">
            /tailor/login
          </Link>{" "}
          once it&apos;s approved.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Tailor Signup" subtitle="Request access to the tailor dashboard">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={loading} className={PRIMARY_BUTTON_CLASS}>
          {loading ? "Submitting…" : "Request Access"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-secondary">
        Already approved?{" "}
        <Link href="/tailor/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
