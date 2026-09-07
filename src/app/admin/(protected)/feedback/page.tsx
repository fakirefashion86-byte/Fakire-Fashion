import { prisma } from "@/lib/prisma";
import FeedbackModerationActions from "@/components/admin/FeedbackModerationActions";
import { garmentLabel } from "@/lib/garment";

export default async function AdminFeedbackPage() {
  const feedback = await prisma.stitchFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { stitchOrder: { include: { stitchCategory: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Stitching Feedback &amp; Ratings</h1>
      {feedback.length === 0 ? (
        <p className="text-ink-muted">No feedback submitted yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {f.stitchOrder.customerName} · {garmentLabel(f.stitchOrder)} (Order #{f.stitchOrderId})
                  </p>
                  <p className="text-sm">
                    {"★".repeat(f.rating)}
                    {"☆".repeat(5 - f.rating)}{" "}
                    <span className="text-xs text-ink-muted capitalize">({f.status})</span>
                  </p>
                </div>
                <FeedbackModerationActions feedbackId={f.id} status={f.status} />
              </div>
              {f.comment && <p className="mt-2 text-sm text-ink-muted">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
