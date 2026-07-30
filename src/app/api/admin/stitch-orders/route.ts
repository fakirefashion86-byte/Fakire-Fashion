import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.stitchOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true },
  });
  return NextResponse.json({ orders });
}
