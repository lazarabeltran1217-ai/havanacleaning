import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/booking-number";

export const dynamic = "force-dynamic";

// POST — Owner creates a booking (walk-in / phone order) and optionally assigns employees
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    serviceId,
    scheduledDate,
    scheduledTime,
    customerName,
    customerPhone,
    street,
    city,
    bedrooms,
    bathrooms,
    notes,
    assignEmployeeIds = [],
  } = body;

  if (!serviceId || !scheduledDate || !scheduledTime || !customerName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Find or create a walk-in customer by phone (or use a generic walk-in account)
  let customerId: string;

  if (customerPhone) {
    const existing = await prisma.user.findFirst({
      where: { phone: customerPhone, role: "CUSTOMER" },
    });
    if (existing) {
      customerId = existing.id;
    } else {
      const customer = await prisma.user.create({
        data: {
          name: customerName,
          email: `walkin-${Date.now()}@havanacleaning.local`,
          password: "",
          phone: customerPhone,
          role: "CUSTOMER",
        },
      });
      customerId = customer.id;
    }
  } else {
    // No phone — create placeholder customer
    const customer = await prisma.user.create({
      data: {
        name: customerName,
        email: `walkin-${Date.now()}@havanacleaning.local`,
        password: "",
        role: "CUSTOMER",
      },
    });
    customerId = customer.id;
  }

  // Create address if provided
  let addressId: string | null = null;
  if (street) {
    const address = await prisma.address.create({
      data: {
        userId: customerId,
        street,
        city: city || "Miami",
        state: "FL",
        zipCode: "",
      },
    });
    addressId = address.id;
  }

  const bookingNumber = await generateBookingNumber();
  const price = service.basePrice;
  const tax = Math.round(price * 0.07 * 100) / 100;

  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      customerId,
      serviceId,
      addressId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      subtotal: price,
      discount: 0,
      tax,
      total: Math.round((price + tax) * 100) / 100,
      status: "CONFIRMED",
      customerNotes: notes || null,
      assignments: {
        create: (assignEmployeeIds as string[]).map((empId: string, i: number) => ({
          employeeId: empId,
          isPrimary: i === 0,
        })),
      },
    },
  });

  return NextResponse.json({ booking: { id: booking.id, bookingNumber: booking.bookingNumber } }, { status: 201 });
}
