import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementsSchema } from "@/lib/stitchMeasurements";
import { notifyAdmins, notifyUser } from "@/lib/notifications";

// Tailor visits are currently offered in Lucknow only (see scope doc) — enforced
// server-side too, not just as a UI nicety, since this is a hard business rule.
const SERVICE_CITY = "lucknow";

const createSchema = z.object({
  stitchCategoryId: z.number().int(),
  measurements: measurementsSchema,
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerMobile: z.string().min(1),
  addressLine: z.string().trim().min(1, "Address is required"),
  houseNumber: z.string().trim().optional().default(""),
  area: z.string().trim().optional().default(""),
  landmark: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  country: z.string().trim().min(1).default("India"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  preferredDate: z.string().min(1),
  preferredTimeSlot: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const orders = await prisma.stitchOrder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.city.trim().toLowerCase() !== SERVICE_CITY) {
    return NextResponse.json(
      { error: "Sorry, home-visit tailor booking is currently available in Lucknow only." },
      { status: 400 }
    );
  }

  const category = await prisma.stitchCategory.findUnique({
    where: { id: parsed.data.stitchCategoryId },
  });
  if (!category) return NextResponse.json({ error: "Invalid stitching category" }, { status: 400 });

  // Carry forward the customer's most recent saved measurements so the tailor isn't starting
  // from a blank form — they can still edit/overwrite them for this order.
  let measurements = parsed.data.measurements;
  if (!measurements || Object.keys(measurements).length === 0) {
    const lastOrder = await prisma.stitchOrder.findFirst({
      where: { userId: session.userId, NOT: { measurements: { equals: {} } } },
      orderBy: { createdAt: "desc" },
      select: { measurements: true },
    });
    if (lastOrder?.measurements) {
      measurements = lastOrder.measurements as typeof measurements;
    }
  }

  const addressParts = [
    parsed.data.houseNumber,
    parsed.data.addressLine,
    parsed.data.area,
    parsed.data.landmark,
    parsed.data.city,
    parsed.data.state,
    parsed.data.pincode,
    parsed.data.country,
  ].filter(Boolean);

  const order = await prisma.stitchOrder.create({
    data: {
      userId: session.userId,
      stitchCategoryId: parsed.data.stitchCategoryId,
      measurements: measurements ?? {},
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerMobile: parsed.data.customerMobile,
      customerAddress: addressParts.join(", "),
      addressLine: parsed.data.addressLine,
      houseNumber: parsed.data.houseNumber || null,
      area: parsed.data.area || null,
      landmark: parsed.data.landmark || null,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      country: parsed.data.country,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      preferredDate: new Date(parsed.data.preferredDate),
      preferredTimeSlot: parsed.data.preferredTimeSlot,
      bookingStatus: "requested",
      status: "not_started",
    },
  });

  await Promise.all([
    notifyUser(
      session.userId,
      "Booking request sent",
      "Your tailor visit request has been received. We'll confirm shortly.",
      "/stitching/my-orders"
    ),
    notifyAdmins(
      "New tailor booking request",
      `${order.customerName} requested a home visit on ${order.preferredDate.toDateString()}.`,
      `/admin/stitch-orders/${order.id}`
    ),
  ]).catch((err) => console.error("Stitch order notification failed", err));

  return NextResponse.json({ order });
}
