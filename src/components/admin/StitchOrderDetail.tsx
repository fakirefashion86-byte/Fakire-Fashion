import StitchStatusSelect from "@/components/admin/StitchStatusSelect";
import VisitToggle from "@/components/admin/VisitToggle";
import MeasurementsForm from "@/components/admin/MeasurementsForm";
import BookingStatusActions from "@/components/admin/BookingStatusActions";
import CopyCoordinatesButton from "@/components/CopyCoordinatesButton";
import { buildDirectionsUrl } from "@/lib/directions";
import { estimatedDeliveryDate } from "@/lib/delivery";

type Order = {
  id: number;
  status: string;
  bookingStatus: string;
  visitCompleted: boolean;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  preferredDate: Date;
  preferredTimeSlot: string;
  measurements: unknown;
  stitchCategory: { name: string };
  feedback: { rating: number; comment: string | null; status: string } | null;
  complaints: { id: number; subject: string; description: string; status: string; createdAt: Date }[];
};

export default function StitchOrderDetail({ order }: { order: Order }) {
  const mapHref =
    order.latitude != null && order.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`;
  const directionsUrl = buildDirectionsUrl({
    latitude: order.latitude,
    longitude: order.longitude,
    address: order.customerAddress,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{order.stitchCategory.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusActions orderId={order.id} bookingStatus={order.bookingStatus} />
            <VisitToggle orderId={order.id} completed={order.visitCompleted} />
            <StitchStatusSelect orderId={order.id} status={order.status} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-muted sm:grid-cols-2">
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerMobile}</p>
          <p>
            {order.customerAddress}{" "}
            <a href={mapHref} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              (open in map)
            </a>
          </p>
          <p>
            Visit: {order.preferredDate.toDateString()} · {order.preferredTimeSlot}
          </p>
          {order.status !== "delivered" && (
            <p>Estimated delivery by {estimatedDeliveryDate(order.createdAt).toDateString()}</p>
          )}
        </div>
        {directionsUrl && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded bg-btn px-3 py-1.5 text-xs font-medium text-btn-text hover:bg-btn-hover"
            >
              🧭 Get Directions
            </a>
            {order.latitude != null && order.longitude != null && (
              <CopyCoordinatesButton
                latitude={order.latitude}
                longitude={order.longitude}
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-section"
              />
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border p-4">
        <MeasurementsForm
          orderId={order.id}
          measurements={(order.measurements ?? {}) as Record<string, number | string | boolean | undefined>}
        />
      </div>

      {order.feedback && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Customer Feedback</h3>
          <p className="text-sm">
            {"★".repeat(order.feedback.rating)}
            {"☆".repeat(5 - order.feedback.rating)}{" "}
            <span className="text-xs text-ink-muted">({order.feedback.status})</span>
          </p>
          {order.feedback.comment && <p className="mt-1 text-sm text-ink-muted">{order.feedback.comment}</p>}
        </div>
      )}

      {order.complaints.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Complaints</h3>
          <div className="flex flex-col gap-2">
            {order.complaints.map((c) => (
              <div key={c.id} className="rounded border border-border p-2 text-sm">
                <p className="font-medium">
                  {c.subject} <span className="text-xs text-ink-muted">({c.status})</span>
                </p>
                <p className="text-ink-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
