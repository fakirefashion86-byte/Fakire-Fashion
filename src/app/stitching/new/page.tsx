import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookTailorForm from "@/components/BookTailorWizard";

export default async function NewStitchOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/stitching/new");

  const [categories, user] = await Promise.all([
    prisma.stitchCategory.findMany({ where: { status: true }, orderBy: { name: "asc" } }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, mobile: true, address: true },
    }),
  ]);

  if (!user) redirect("/login?next=/stitching/new");

  return (
    <div className="relative min-h-screen bg-[#0c0a08] text-white flex flex-col items-center pt-16 pb-24 px-4 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #c6a664 0%, transparent 70%)" }} />
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif text-white mb-4 tracking-wide">
          Book <span className="text-gold italic">Tailor</span>
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
          Experience our white-glove concierge service. Our master tailors will visit your home to take precise measurements and discuss your requirements.
        </p>
      </div>
      
      <BookTailorForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, gender: c.gender }))}
        defaultValues={{
          customerName: user.name,
          customerEmail: user.email,
          customerMobile: user.mobile ?? "",
          customerAddress: user.address ?? "",
        }}
      />
    </div>
  );
}
