import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StitchOrderFeedbackComplaint from "@/components/StitchOrderFeedbackComplaint";

const BOOKING_LABELS: Record<string, string> = {
  requested: "Awaiting confirmation",
  accepted: "Confirmed",
  rejected: "Not accepted",
};
const BOOKING_COLORS: Record<string, string> = {
  requested: "bg-border text-ink-muted",
  accepted: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  pending: "Pending",
  stitched: "Stitched",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-border text-ink-muted",
  pending: "bg-yellow-100 text-yellow-800",
  stitched: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-success/10 text-success",
};

export default async function MyStitchOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/stitching/my-orders");

  const orders = await prisma.stitchOrder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true, feedback: true, complaints: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your Stitching Orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-muted">
          You haven&apos;t placed any stitching orders yet.{" "}
          <Link href="/stitching/new" className="underline">
            Order now
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{order.stitchCategory.name}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${BOOKING_COLORS[order.bookingStatus]}`}
                  >
                    {BOOKING_LABELS[order.bookingStatus]}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Submitted {order.createdAt.toDateString()}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Visit: {order.preferredDate.toDateString()} · {order.preferredTimeSlot}
              </p>
              <p className="mt-1 text-sm text-ink-muted">Delivery to: {order.customerAddress}</p>

              {order.status === "delivered" && (
                <StitchOrderFeedbackComplaint
                  orderId={order.id}
                  feedback={order.feedback}
                  complaints={order.complaints}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
