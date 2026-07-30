import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StitchOrderForm from "@/components/StitchOrderForm";

export default async function NewStitchOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/stitching/new");

  const [categories, user] = await Promise.all([
    prisma.stitchCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, mobile: true, address: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Order Custom Stitching</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Choose a garment type and share your measurements — our tailors will do the rest.
      </p>
      <StitchOrderForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          customerName: user?.name ?? "",
          customerEmail: user?.email ?? "",
          customerMobile: user?.mobile ?? "",
          customerAddress: user?.address ?? "",
        }}
      />
    </div>
  );
}
