import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/booking-number";
import { calculatePrice } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      serviceId,
      bedrooms = 2,
      bathrooms = 2,
      recurrence = "ONCE",
      scheduledDate,
      scheduledTime,
      addOnIds = [],
      customerNotes,
      addressId,
      newAddress,
    } = body;

    if (!serviceId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const customerId = session.user.id;

    // Calculate price server-side
    const pricing = await calculatePrice({ serviceId, bedrooms, bathrooms, addOnIds });

    const discountRates: Record<string, number> = { ONCE: 0, WEEKLY: 0.2, BIWEEKLY: 0.15, MONTHLY: 0.1 };
    const discountRate = discountRates[recurrence] ?? 0;
    const discount = Math.round(pricing.subtotal * discountRate * 100) / 100;
    const afterDiscount = pricing.subtotal - discount;
    const tax = Math.round(afterDiscount * 0.07 * 100) / 100;
    const total = Math.round((afterDiscount + tax) * 100) / 100;

    // Resolve address: use existing or create new
    let resolvedAddressId: string | null = null;
    if (addressId) {
      const addr = await prisma.address.findFirst({ where: { id: addressId, userId: customerId } });
      if (addr) resolvedAddressId = addr.id;
    } else if (newAddress?.street) {
      const created = await prisma.address.create({
        data: {
          userId: customerId,
          label: newAddress.label || "Home",
          street: newAddress.street,
          unit: newAddress.unit || null,
          city: newAddress.city || "Miami",
          state: newAddress.state || "FL",
          zipCode: newAddress.zipCode || "",
        },
      });
      resolvedAddressId = created.id;
    }

    const bookingNumber = await generateBookingNumber();

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
        customerId,
        serviceId,
        addressId: resolvedAddressId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        bedrooms,
        bathrooms,
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
  } catch (err) {
    console.error("Account booking POST error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
