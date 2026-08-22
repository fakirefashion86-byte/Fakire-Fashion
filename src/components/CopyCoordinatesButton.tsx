"use client";

import { useState } from "react";

type Props = {
  latitude: number;
  longitude: number;
  className?: string;
};

/**
 * Secondary option alongside the "Get Directions" link (see
 * src/lib/directions.ts): lets an admin/delivery/tailor person copy the raw
 * pin so they can paste it into whatever maps app they actually have open on
 * their phone (Apple Maps, Waze, etc.) if they'd rather not use Google Maps.
 */
export default function CopyCoordinatesButton({ latitude, longitude, className }: Props) {
  const [copied, setCopied] = useState(false);
  const text = `${latitude}, ${longitude}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (permissions, insecure context) — fall back to
      // a manual copy so the coordinates are never a dead end.
      window.prompt("Copy these coordinates:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded border border-border px-4 py-2 text-sm font-medium hover:bg-section"
      }
    >
      {copied ? "✓ Copied" : `📋 Copy coordinates (${text})`}
    </button>
  );
}
