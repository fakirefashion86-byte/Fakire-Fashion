import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HOMEPAGE_CONTENT, HOMEPAGE_CONTENT_KEY, HomepageContent } from "@/lib/siteContent";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const row = await prisma.siteContent.findUnique({ where: { key: HOMEPAGE_CONTENT_KEY } });
  const content: HomepageContent = {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...((row?.data as Partial<HomepageContent>) ?? {}),
  };

  return NextResponse.json({ content });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.siteContent.findUnique({ where: { key: HOMEPAGE_CONTENT_KEY } });
  const merged: HomepageContent = {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...((existing?.data as Partial<HomepageContent>) ?? {}),
    ...body,
  };

  const row = await prisma.siteContent.upsert({
    where: { key: HOMEPAGE_CONTENT_KEY },
    update: { data: merged },
    create: { key: HOMEPAGE_CONTENT_KEY, data: merged },
  });

  return NextResponse.json({ content: row.data });
}
