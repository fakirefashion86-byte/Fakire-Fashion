"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductReviewForm({ productId, loggedIn }: { productId: number; loggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <p className="text-sm text-[#6b5a35]">
        <a href="/login" className="underline">
          Log in
        </a>{" "}
        to write a review.
      </p>
    );
  }

  if (submitted) {
    return (
      <p className="text-sm text-[#3F7A4E]">
        Thanks for sharing your experience!
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-[#2b2116] underline underline-offset-2"
      >
        Write a review
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not submit your review. Please try again.");
        return;
      }
      setSubmitted(true);
      router.refresh();
    } catch {
      setError("Could not submit your review. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-lg border border-[#EAD9B8] p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
            className={`text-lg ${n <= rating ? "text-[#C7A03D]" : "text-[#E3D3AC]"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product (optional)"
        rows={3}
        className="rounded border border-[#EAD9B8] p-2 text-sm"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#15110b] px-3 py-1.5 text-xs font-semibold text-[#F2D98A] disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#6b5a35] hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
