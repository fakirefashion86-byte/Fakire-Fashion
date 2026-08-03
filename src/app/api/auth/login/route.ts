import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password, rememberMe } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!user.approved) {
    return NextResponse.json(
      { error: "Your account is awaiting admin approval. Please check back later." },
      { status: 403 }
    );
  }

  await setSessionCookie({ userId: user.id, role: user.role }, { rememberMe });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
