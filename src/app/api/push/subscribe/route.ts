import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// Called from PushOptIn.tsx after the browser grants permission and
// PushManager.subscribe() succeeds. Upserts on endpoint so re-subscribing
// (e.g. after clearing site data) doesn't create duplicate rows, and so the
// same endpoint moves to a new userId if a different account subscribes
// from the same browser.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: session.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    update: { userId: session.userId, p256dh: keys.p256dh, auth: keys.auth, userAgent },
  });

  return NextResponse.json({ ok: true });
}

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

// Called when the user turns notifications off, or the browser reports the
// subscription as no longer valid.
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: session.userId },
  });

  return NextResponse.json({ ok: true });
}
