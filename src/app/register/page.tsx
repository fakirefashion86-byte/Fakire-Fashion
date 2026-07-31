"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

type Role = "customer" | "tailor";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: Role = searchParams.get("role") === "tailor" ? "tailor" : "customer";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tailorSubmitted, setTailorSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = role === "tailor" ? "/api/tailor/signup" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Registration failed");
      return;
    }

    if (role === "tailor") {
      setTailorSubmitted(true);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (tailorSubmitted) {
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
    <AuthLayout title="Create an Account" subtitle="Join Fakire Fashion">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-section p-1">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`rounded-md py-2 text-sm font-medium transition ${
            role === "customer" ? "bg-btn text-btn-text" : "text-ink-secondary hover:text-foreground"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("tailor")}
          className={`rounded-md py-2 text-sm font-medium transition ${
            role === "tailor" ? "bg-btn text-btn-text" : "text-ink-secondary hover:text-foreground"
          }`}
        >
          Tailor
        </button>
      </div>

      {role === "tailor" && (
        <p className="mb-4 text-xs text-ink-muted">
          Tailor accounts need admin approval before you can log in.
        </p>
      )}

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
        <PasswordInput
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={loading} className={PRIMARY_BUTTON_CLASS}>
          {loading ? "Creating account…" : role === "tailor" ? "Request Access" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
