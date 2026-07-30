import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tailors = await prisma.user.findMany({
    where: { role: "tailor" },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, mobile: true, approved: true, createdAt: true },
  });

  return NextResponse.json({ tailors });
}
