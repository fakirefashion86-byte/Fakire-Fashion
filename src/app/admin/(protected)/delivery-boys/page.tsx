import { prisma } from "@/lib/prisma";
import DeliveryBoyRowActions from "@/components/admin/DeliveryBoyRowActions";

export default async function AdminDeliveryBoysPage() {
  const deliveryBoys = await prisma.user.findMany({
    where: { role: "delivery" },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, mobile: true, approved: true, createdAt: true },
  });

  const pending = deliveryBoys.filter((d) => !d.approved);
  const approved = deliveryBoys.filter((d) => d.approved);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Delivery Boys</h1>

      <h2 className="mb-3 font-serif text-lg text-foreground">
        Pending Approval {pending.length > 0 && `(${pending.length})`}
      </h2>
      {pending.length === 0 ? (
        <p className="mb-8 text-sm text-ink-muted">No pending requests.</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="mb-8 flex flex-col gap-3 sm:hidden">
            {pending.map((d) => (
              <div key={d.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="mt-1 truncate text-sm text-ink-muted">{d.email}</p>
                <p className="text-sm text-ink-muted">{d.mobile || "—"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Requested {d.createdAt.toDateString()}</span>
                  <DeliveryBoyRowActions deliveryBoyId={d.id} approved={d.approved} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="mb-8 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Mobile</th>
                  <th className="py-2">Requested</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((d) => (
                  <tr key={d.id} className="border-b border-divider">
                    <td className="py-2">{d.name}</td>
                    <td className="py-2">{d.email}</td>
                    <td className="py-2">{d.mobile || "—"}</td>
                    <td className="py-2 text-ink-muted">{d.createdAt.toDateString()}</td>
                    <td className="py-2">
                      <DeliveryBoyRowActions deliveryBoyId={d.id} approved={d.approved} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="mb-3 font-serif text-lg text-foreground">Approved Delivery Boys</h2>
      {approved.length === 0 ? (
        <p className="text-sm text-ink-muted">No approved delivery boys yet.</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {approved.map((d) => (
              <div key={d.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="mt-1 truncate text-sm text-ink-muted">{d.email}</p>
                <p className="text-sm text-ink-muted">{d.mobile || "—"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Since {d.createdAt.toDateString()}</span>
                  <DeliveryBoyRowActions deliveryBoyId={d.id} approved={d.approved} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Mobile</th>
                  <th className="py-2">Since</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {approved.map((d) => (
                  <tr key={d.id} className="border-b border-divider">
                    <td className="py-2">{d.name}</td>
                    <td className="py-2">{d.email}</td>
                    <td className="py-2">{d.mobile || "—"}</td>
                    <td className="py-2 text-ink-muted">{d.createdAt.toDateString()}</td>
                    <td className="py-2">
                      <DeliveryBoyRowActions deliveryBoyId={d.id} approved={d.approved} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
