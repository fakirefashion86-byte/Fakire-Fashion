import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });

  await prisma.enquiry.create({ data: parsed.data });

  return NextResponse.json({ ok: true });
}
