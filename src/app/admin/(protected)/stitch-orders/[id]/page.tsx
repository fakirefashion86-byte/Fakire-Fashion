import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StitchOrderDetail from "@/components/admin/StitchOrderDetail";

export default async function AdminStitchOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.stitchOrder.findUnique({
    where: { id: Number(id) },
    include: { stitchCategory: true },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/stitch-orders" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to Stitching Orders
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Order #{order.id}</h1>
      <StitchOrderDetail order={order} />
    </div>
  );
}
