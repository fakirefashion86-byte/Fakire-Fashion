"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

type Props = {
  initialName: string;
  initialMobile: string;
  initialAddress: string;
};

export default function ProfileForm({ initialName, initialMobile, initialAddress }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, address }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update profile");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      <label className="text-sm text-ink-muted">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 w-full ${INPUT_CLASS}`}
        />
      </label>
      <label className="text-sm text-ink-muted">
        Mobile
        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className={`mt-1 w-full ${INPUT_CLASS}`}
        />
      </label>
      <label className="text-sm text-ink-muted">
        Address
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className={`mt-1 w-full ${INPUT_CLASS}`}
        />
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-success">Profile updated.</p>}
      <button type="submit" disabled={loading} className={PRIMARY_BUTTON_CLASS}>
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
