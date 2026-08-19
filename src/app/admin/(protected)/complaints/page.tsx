import { prisma } from "@/lib/prisma";
import ComplaintStatusSelect from "@/components/admin/ComplaintStatusSelect";

export default async function AdminComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    include: { stitchOrder: { include: { stitchCategory: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Alteration / Complaint Requests</h1>
      {complaints.length === 0 ? (
        <p className="text-ink-muted">No complaints raised yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {c.subject} — {c.stitchOrder.customerName} · {c.stitchOrder.stitchCategory.name} (Order #{c.stitchOrderId})
                  </p>
                  <p className="text-xs text-ink-muted">{c.createdAt.toLocaleString()}</p>
                </div>
                <ComplaintStatusSelect complaintId={c.id} status={c.status} />
              </div>
              <p className="mt-2 text-sm text-ink-muted">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
