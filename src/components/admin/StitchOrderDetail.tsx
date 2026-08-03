import StitchStatusSelect from "@/components/admin/StitchStatusSelect";
import VisitToggle from "@/components/admin/VisitToggle";
import MeasurementsForm from "@/components/admin/MeasurementsForm";

type Order = {
  id: number;
  status: string;
  visitCompleted: boolean;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  preferredDate: Date;
  preferredTimeSlot: string;
  measurements: unknown;
  stitchCategory: { name: string };
};

export default function StitchOrderDetail({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{order.stitchCategory.name}</h2>
          <div className="flex items-center gap-2">
            <VisitToggle orderId={order.id} completed={order.visitCompleted} />
            <StitchStatusSelect orderId={order.id} status={order.status} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-muted sm:grid-cols-2">
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerMobile}</p>
          <p>{order.customerAddress}</p>
          <p>
            Visit: {order.preferredDate.toDateString()} · {order.preferredTimeSlot}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <MeasurementsForm
          orderId={order.id}
          measurements={(order.measurements ?? {}) as Record<string, number | boolean | undefined>}
        />
      </div>
    </div>
  );
}
