import { prisma } from "@/lib/prisma";
import FeedbackModerationActions from "@/components/admin/FeedbackModerationActions";

export default async function AdminProductReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } }, user: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Product Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-ink-muted">No product reviews submitted yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {r.product.name} · {r.user.name}
                  </p>
                  <p className="text-sm">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}{" "}
                    <span className="text-xs text-ink-muted capitalize">({r.status})</span>
                  </p>
                </div>
                <FeedbackModerationActions feedbackId={r.id} status={r.status} endpoint="/api/admin/product-reviews" />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-muted">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
