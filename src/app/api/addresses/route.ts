import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressInputSchema } from "@/lib/address";

// List the logged-in customer's saved addresses. Ownership is enforced by
// scoping the query to session.userId — same pattern as /api/cart and
// /api/orders (this project has no Supabase RLS; authorization happens here).
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addressInputSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid address";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const data = parsed.data;

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: { ...data, userId: session.userId },
    });
  });

  return NextResponse.json({ address }, { status: 201 });
}
