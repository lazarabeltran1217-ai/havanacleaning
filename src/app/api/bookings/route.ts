import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/booking-number";
import { calculatePrice } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    serviceId,
    bedrooms,
    bathrooms,
    recurrence = "ONCE",
    scheduledDate,
    scheduledTime,
    addOnIds = [],
    customerNotes,
    address,
  } = body;

  if (!serviceId || !scheduledDate || !scheduledTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate service exists
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  // Calculate price server-side
  const pricing = await calculatePrice({
    serviceId,
    bedrooms: bedrooms || 2,
    bathrooms: bathrooms || 2,
    addOnIds,
  });

  // Apply recurring discount
  const discountRates: Record<string, number> = {
    ONCE: 0,
    WEEKLY: 0.2,
    BIWEEKLY: 0.15,
    MONTHLY: 0.1,
  };
  const discountRate = discountRates[recurrence] ?? 0;
  const discount = Math.round(pricing.subtotal * discountRate * 100) / 100;
  const afterDiscount = pricing.subtotal - discount;
  const tax = Math.round(afterDiscount * 0.07 * 100) / 100;
  const total = Math.round((afterDiscount + tax) * 100) / 100;

  // Create or find address
  let addressId: string | undefined;
  if (address?.street) {
    const created = await prisma.address.create({
      data: {
        userId: session.user.id,
        street: address.street,
        unit: address.unit || null,
        city: address.city || "Miami",
        state: address.state || "FL",
        zipCode: address.zipCode || "",
      },
    });
    addressId = created.id;
  }

  const bookingNumber = await generateBookingNumber();

  // Fetch add-on prices upfront
  let addOnsData: { id: string; price: number }[] = [];
  if (addOnIds.length > 0) {
    addOnsData = await prisma.serviceAddOn.findMany({
      where: { id: { in: addOnIds }, isActive: true },
      select: { id: true, price: true },
    });
  }

  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      customerId: session.user.id,
      serviceId,
      addressId: addressId || null,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      recurrence,
      subtotal: pricing.subtotal,
      discount,
      tax,
      total,
      customerNotes: customerNotes || null,
      addOns: {
        create: addOnsData.map((addon) => ({
          addOnId: addon.id,
          price: addon.price,
        })),
      },
    },
  });

  return NextResponse.json({ booking: { id: booking.id, bookingNumber: booking.bookingNumber } });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (session.user.role === "CUSTOMER") {
    where.customerId = session.user.id;
  }

  if (status) {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: { select: { name: true, icon: true } },
      address: true,
      customer: { select: { name: true, email: true } },
    },
    orderBy: { scheduledDate: "desc" },
    take: 50,
  });

  return NextResponse.json({ bookings });
}
