"use client";

import { useState } from "react";

type Props = {
  latitude: number;
  longitude: number;
  className?: string;
};

/**
 * Interim stand-in for a real navigation hand-off while we don't have a Google
 * Maps API key wired up: lets an admin/delivery person copy the raw pin so
 * they can paste it into whatever maps app they actually have open on their
 * phone (Google Maps, Apple Maps, etc.) and start turn-by-turn navigation
 * from there.
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
