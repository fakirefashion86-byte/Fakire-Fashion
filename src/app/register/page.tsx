"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoldAuthLayout from "@/components/GoldAuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { ArrowRightIcon } from "@/components/icons";
import { GOLD_INPUT_CLASS, GOLD_LABEL_CLASS, GOLD_BUTTON_CLASS, GOLD_ICON_CLASS } from "@/lib/goldAuthStyles";

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
      <GoldAuthLayout title="Request Submitted">
        <p className="text-center text-sm text-white/70">
          Thanks, {name}. Your tailor account request has been sent to the admin for approval.
          You&apos;ll be able to log in at{" "}
          <Link href="/tailor/login" className="text-[#e3c17a] hover:underline">
            /tailor/login
          </Link>{" "}
          once it&apos;s approved.
        </p>
      </GoldAuthLayout>
    );
  }

  return (
    <GoldAuthLayout
      title={
        <>
          Create an <span className="text-[#e3c17a]">Account</span>
        </>
      }
      subtitle="Join Fakire Fashion"
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-[#d4af6a]/20 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`rounded-md py-2 text-sm font-medium transition ${
            role === "customer"
              ? "bg-gradient-to-r from-[#f0c674] to-[#d4af6a] text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("tailor")}
          className={`rounded-md py-2 text-sm font-medium transition ${
            role === "tailor"
              ? "bg-gradient-to-r from-[#f0c674] to-[#d4af6a] text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          Tailor
        </button>
      </div>

      {role === "tailor" && (
        <p className="mb-4 text-xs text-white/50">
          Tailor accounts need admin approval before you can log in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={GOLD_LABEL_CLASS}>Full Name</label>
          <input
            required
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={GOLD_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={GOLD_LABEL_CLASS}>Email Address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={GOLD_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={GOLD_LABEL_CLASS}>Mobile Number</label>
          <input
            placeholder="Mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className={GOLD_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={GOLD_LABEL_CLASS}>Password</label>
          <PasswordInput
            required
            minLength={6}
            placeholder="Min 6 characters"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            className={GOLD_INPUT_CLASS}
            iconClassName={GOLD_ICON_CLASS}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 2.987-1.743 2.987H3.482c-1.53 0-2.493-1.653-1.743-2.987l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className={GOLD_BUTTON_CLASS}>
          {loading ? "Creating account…" : role === "tailor" ? "Request Access" : "Sign up"}
          {!loading && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#e3c17a] hover:underline">
          Log in
        </Link>
      </p>
    </GoldAuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
