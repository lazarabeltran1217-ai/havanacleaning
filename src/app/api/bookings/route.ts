import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/booking-number";
import { calculatePrice } from "@/lib/pricing";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    serviceId,
    serviceIds: rawServiceIds,
    bedrooms,
    bathrooms,
    recurrence = "ONCE",
    scheduledDate,
    scheduledTime,
    addOnIds = [],
    customerNotes,
    customerName,
    customerEmail,
    customerPhone,
    customerPassword,
    rush,
    address,
  } = body;

  // Support both single serviceId and multi serviceIds
  const serviceIds: string[] =
    Array.isArray(rawServiceIds) && rawServiceIds.length > 0
      ? rawServiceIds
      : serviceId
        ? [serviceId]
        : [];

  if (serviceIds.length === 0 || !scheduledDate || !scheduledTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Validate all services exist
  const validServices = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  });
  if (validServices.length !== serviceIds.length) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  // Resolve customer: always use the provided email to find or create
  if (!customerPassword || customerPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  let customerId: string;
  const email = customerEmail.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    customerId = existing.id;
    // Update name/phone for returning customer
    await prisma.user.update({
      where: { id: customerId },
      data: {
        name: customerName.trim(),
        ...(customerPhone ? { phone: customerPhone.trim() } : {}),
      },
    });
  } else {
    // Create a new customer account
    const hashedPassword = await hash(customerPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        name: customerName.trim(),
        email,
        password: hashedPassword,
        phone: customerPhone?.trim() || null,
        role: "CUSTOMER",
      },
    });
    customerId = newUser.id;
  }

  // Apply recurring discount
  const discountRates: Record<string, number> = {
    ONCE: 0,
    WEEKLY: 0.2,
    BIWEEKLY: 0.15,
    MONTHLY: 0.1,
  };
  const discountRate = discountRates[recurrence] ?? 0;

  // Create or find address
  let addressId: string | undefined;
  if (address?.street) {
    const created = await prisma.address.create({
      data: {
        userId: customerId,
        street: address.street,
        unit: address.unit || null,
        city: address.city || "Miami",
        state: address.state || "FL",
        zipCode: address.zipCode || "",
      },
    });
    addressId = created.id;
  }

  // Fetch add-on prices upfront
  let addOnsData: { id: string; price: number }[] = [];
  if (addOnIds.length > 0) {
    addOnsData = await prisma.serviceAddOn.findMany({
      where: { id: { in: addOnIds }, isActive: true },
      select: { id: true, price: true },
    });
  }

  // Create one booking per selected service
  const bookings: { id: string; bookingNumber: string }[] = [];
  for (let i = 0; i < serviceIds.length; i++) {
    const sid = serviceIds[i];

    // Calculate price server-side (add-ons + rush fee only on first booking)
    const pricing = await calculatePrice({
      serviceId: sid,
      bedrooms: bedrooms || 2,
      bathrooms: bathrooms || 2,
      addOnIds: i === 0 ? addOnIds : [],
    });

    const rushFee = (i === 0 && rush) ? 50 : 0;
    const pricingSubtotal = pricing.subtotal + rushFee;
    const discount = Math.round(pricingSubtotal * discountRate * 100) / 100;
    const afterDiscount = pricingSubtotal - discount;
    const tax = Math.round(afterDiscount * 0.07 * 100) / 100;
    const total = Math.round((afterDiscount + tax) * 100) / 100;

    const bookingNumber = await generateBookingNumber();

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        serviceId: sid,
        addressId: addressId || null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        recurrence,
        subtotal: pricingSubtotal,
        discount,
        tax,
        total,
        customerNotes: rush
          ? `[RUSH] ${customerNotes || "Same-day / ASAP requested"}`
          : (customerNotes || null),
        ...(i === 0 && addOnsData.length > 0
          ? {
              addOns: {
                create: addOnsData.map((addon) => ({
                  addOnId: addon.id,
                  price: addon.price,
                })),
              },
            }
          : {}),
      },
    });
    bookings.push({ id: booking.id, bookingNumber: booking.bookingNumber });
  }

  return NextResponse.json({
    booking: bookings[0],
    bookings,
  });
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
