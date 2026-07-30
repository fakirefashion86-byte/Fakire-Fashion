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
        <table className="mb-8 w-full text-sm">
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
      )}

      <h2 className="mb-3 font-serif text-lg text-foreground">Approved Tailors</h2>
      {approved.length === 0 ? (
        <p className="text-sm text-ink-muted">No approved tailors yet.</p>
      ) : (
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
      )}
    </div>
  );
}
