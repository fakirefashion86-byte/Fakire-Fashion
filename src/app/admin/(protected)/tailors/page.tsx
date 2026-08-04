import { prisma } from "@/lib/prisma";
import TailorRowActions from "@/components/admin/TailorRowActions";

export default async function AdminTailorsPage() {
  const tailors = await prisma.user.findMany({
    where: { role: "tailor" },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, mobile: true, approved: true, createdAt: true },
  });

  const pending = tailors.filter((t) => !t.approved);
  const approved = tailors.filter((t) => t.approved);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tailors</h1>

      <h2 className="mb-3 font-serif text-lg text-foreground">
        Pending Approval {pending.length > 0 && `(${pending.length})`}
      </h2>
      {pending.length === 0 ? (
        <p className="mb-8 text-sm text-ink-muted">No pending requests.</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="mb-8 flex flex-col gap-3 sm:hidden">
            {pending.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="mt-1 truncate text-sm text-ink-muted">{t.email}</p>
                <p className="text-sm text-ink-muted">{t.mobile || "—"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Requested {t.createdAt.toDateString()}</span>
                  <TailorRowActions tailorId={t.id} approved={t.approved} />
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
                {pending.map((t) => (
                  <tr key={t.id} className="border-b border-divider">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2">{t.email}</td>
                    <td className="py-2">{t.mobile || "—"}</td>
                    <td className="py-2 text-ink-muted">{t.createdAt.toDateString()}</td>
                    <td className="py-2">
                      <TailorRowActions tailorId={t.id} approved={t.approved} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="mb-3 font-serif text-lg text-foreground">Approved Tailors</h2>
      {approved.length === 0 ? (
        <p className="text-sm text-ink-muted">No approved tailors yet.</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {approved.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="mt-1 truncate text-sm text-ink-muted">{t.email}</p>
                <p className="text-sm text-ink-muted">{t.mobile || "—"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Since {t.createdAt.toDateString()}</span>
                  <TailorRowActions tailorId={t.id} approved={t.approved} />
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
                {approved.map((t) => (
                  <tr key={t.id} className="border-b border-divider">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2">{t.email}</td>
                    <td className="py-2">{t.mobile || "—"}</td>
                    <td className="py-2 text-ink-muted">{t.createdAt.toDateString()}</td>
                    <td className="py-2">
                      <TailorRowActions tailorId={t.id} approved={t.approved} />
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
