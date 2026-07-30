"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageContent } from "@/lib/siteContent";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

export default function ContentEditorForm({ initial }: { initial: HomepageContent }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Hero Section</legend>
        <div className="flex flex-col gap-3">
          <label className="text-xs text-ink-muted">
            Badge text
            <input
              value={values.heroBadge}
              onChange={(e) => update("heroBadge", e.target.value)}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          <label className="text-xs text-ink-muted">
            Heading
            <input
              value={values.heroHeading}
              onChange={(e) => update("heroHeading", e.target.value)}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          <label className="text-xs text-ink-muted">
            Heading accent (highlighted word)
            <input
              value={values.heroHeadingAccent}
              onChange={(e) => update("heroHeadingAccent", e.target.value)}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          <label className="text-xs text-ink-muted">
            Subheading
            <textarea
              value={values.heroSubheading}
              onChange={(e) => update("heroSubheading", e.target.value)}
              rows={2}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          <label className="text-xs text-ink-muted">
            Hero image URL
            <input
              value={values.heroImageUrl}
              onChange={(e) => update("heroImageUrl", e.target.value)}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          {values.heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.heroImageUrl}
              alt="Hero preview"
              className="h-32 w-full rounded object-cover"
            />
          )}
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Call-to-Action Banner</legend>
        <div className="flex flex-col gap-3">
          <label className="text-xs text-ink-muted">
            Heading
            <textarea
              value={values.ctaHeading}
              onChange={(e) => update("ctaHeading", e.target.value)}
              rows={2}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
          <label className="text-xs text-ink-muted">
            Button text
            <input
              value={values.ctaButtonText}
              onChange={(e) => update("ctaButtonText", e.target.value)}
              className={`${INPUT_CLASS} mt-1 w-full`}
            />
          </label>
        </div>
      </fieldset>

      {saved && <p className="text-sm text-success">Saved.</p>}
      <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLASS} self-start`}>
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
