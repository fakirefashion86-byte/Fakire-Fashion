import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StitchOrderDetail from "@/components/admin/StitchOrderDetail";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <DeleteOrderButton orderId={order.id} redirectTo="/admin/stitch-orders" />
      </div>
      <StitchOrderDetail order={order} />
    </div>
  );
}
