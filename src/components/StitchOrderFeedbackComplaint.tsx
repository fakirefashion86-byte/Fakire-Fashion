"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Feedback = { rating: number; comment: string | null; status: string } | null;
type Complaint = { id: number; subject: string; description: string; status: string };

export default function StitchOrderFeedbackComplaint({
  orderId,
  feedback,
  complaints,
}: {
  orderId: number;
  feedback: Feedback;
  complaints: Complaint[];
}) {
  const router = useRouter();
  const [rating, setRating] = useState(feedback?.rating ?? 5);
  const [comment, setComment] = useState(feedback?.comment ?? "");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/stitch-orders/${orderId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not submit feedback. Please try again.");
      return;
    }
    setShowFeedbackForm(false);
    router.refresh();
  }

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/stitch-orders/${orderId}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, description }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit your request. Please try again.");
      return;
    }
    setSubject("");
    setDescription("");
    setShowComplaintForm(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
      {/* Feedback */}
      {feedback ? (
        <div className="text-sm">
          <p>
            Your rating: {"★".repeat(feedback.rating)}
            {"☆".repeat(5 - feedback.rating)}
          </p>
          {feedback.comment && <p className="text-ink-muted">{feedback.comment}</p>}
        </div>
      ) : showFeedbackForm ? (
        <form onSubmit={submitFeedback} className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
                className={`text-lg ${n <= rating ? "text-gold" : "text-border"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={2}
            className="rounded border border-border p-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded bg-btn px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
              Submit Feedback
            </button>
            <button type="button" onClick={() => setShowFeedbackForm(false)} className="text-xs text-ink-muted hover:underline">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowFeedbackForm(true)} className="self-start text-sm font-medium text-accent hover:underline">
          Rate & Review
        </button>
      )}

      {/* Complaints */}
      {complaints.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {complaints.map((c) => (
            <div key={c.id} className="rounded border border-border p-2 text-xs">
              <p className="font-medium">
                {c.subject} <span className="text-ink-muted capitalize">({c.status.replace("_", " ")})</span>
              </p>
              <p className="text-ink-muted">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {showComplaintForm ? (
        <form onSubmit={submitComplaint} className="flex flex-col gap-2 text-sm">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Fitting issue)"
            className="rounded border border-border p-2 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the alteration/complaint"
            rows={2}
            className="rounded border border-border p-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded bg-btn px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
              Submit Request
            </button>
            <button type="button" onClick={() => setShowComplaintForm(false)} className="text-xs text-ink-muted hover:underline">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowComplaintForm(true)} className="self-start text-sm font-medium text-accent hover:underline">
          Raise Alteration / Complaint
        </button>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
