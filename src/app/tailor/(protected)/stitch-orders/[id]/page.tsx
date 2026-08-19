import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StitchOrderDetail from "@/components/admin/StitchOrderDetail";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";

export default async function TailorStitchOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.stitchOrder.findUnique({
    where: { id: Number(id) },
    include: { stitchCategory: true, feedback: true, complaints: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/tailor" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to Stitching Orders
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <DeleteOrderButton orderId={order.id} redirectTo="/tailor" />
      </div>
      <StitchOrderDetail order={order} />
    </div>
  );
}
