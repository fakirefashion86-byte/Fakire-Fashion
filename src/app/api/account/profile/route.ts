import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(100),
  mobile: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, mobile, address } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name,
      mobile: mobile || null,
      address: address || null,
    },
    select: { name: true, email: true, mobile: true, address: true },
  });

  // The header reads the display name straight off the session cookie (no
  // DB call — see components/Header.tsx), so it has to be re-signed here or
  // the nav would keep showing the old name until the next login.
  await setSessionCookie({ userId: session.userId, role: session.role, name: user.name }, { rememberMe: true });

  return NextResponse.json({ user });
}
