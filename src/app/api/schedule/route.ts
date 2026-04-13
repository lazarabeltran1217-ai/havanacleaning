import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weekStartET } from "@/lib/timezone";

export const dynamic = "force-dynamic";

// GET — bookings for a given week + all employees
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get("start"); // ISO date string
  const endParam = searchParams.get("end"); // ISO date string (optional)

  let start: Date;
  if (startParam) {
    start = new Date(startParam);
  } else {
    // Default to current week's Monday (Eastern Time)
    start = weekStartET();
  }

  let end: Date;
  if (endParam) {
    end = new Date(endParam);
  } else {
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  }

  const [bookings, handymanInquiries, employees, activeClocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        scheduledDate: { gte: start, lt: end },
        status: { not: "CANCELLED" },
      },
      include: {
        service: { select: { name: true, icon: true } },
        customer: { select: { name: true, phone: true } },
        address: { select: { street: true, city: true } },
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                addresses: {
                  select: { street: true, city: true, state: true, zipCode: true },
                  take: 1,
                  orderBy: { createdAt: "desc" as const },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledTime: "asc" },
    }),
    prisma.handymanInquiry.findMany({
      where: {
        preferredDate: { gte: start, lt: end },
        status: { not: "CANCELLED" },
      },
      include: {
        user: { select: { name: true, phone: true } },
      },
      orderBy: { preferredTime: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      select: {
        id: true,
        name: true,
        addresses: {
          select: { street: true, city: true, state: true, zipCode: true },
          take: 1,
          orderBy: { createdAt: "desc" as const },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.timeEntry.findMany({
      where: { clockOut: null },
      select: { bookingId: true, handymanInquiryId: true },
    }),
  ]);

  // Build set of clocked-in booking/handyman IDs
  const clockedBookingIds = new Set(activeClocks.filter((c) => c.bookingId).map((c) => c.bookingId));
  const clockedHmIds = new Set(activeClocks.filter((c) => c.handymanInquiryId).map((c) => c.handymanInquiryId));

  // Transform handyman inquiries to match booking shape
  const hmBookings = handymanInquiries.map((hm) => {
    const assignedIds = (Array.isArray(hm.assignedEmployees) ? hm.assignedEmployees : []) as string[];
    const resolvedAssignments = assignedIds
      .map((eid) => {
        const emp = employees.find((e) => e.id === eid);
        return emp ? { employee: { id: emp.id, name: emp.name, addresses: emp.addresses } } : null;
      })
      .filter(Boolean);

    return {
      id: hm.id,
      isHandyman: true,
      isClockedIn: clockedHmIds.has(hm.id),
      bookingNumber: hm.bookingNumber,
      scheduledDate: hm.preferredDate?.toISOString() || new Date().toISOString(),
      scheduledTime: hm.preferredTime || "morning",
      estimatedHours: null,
      status: hm.status,
      service: { name: "Handyman Service", icon: "wrench" },
      customer: { name: hm.user?.name || hm.fullName, phone: hm.user?.phone || hm.phone },
      address: hm.address ? { street: hm.address, city: "" } : null,
      assignments: resolvedAssignments,
    };
  });

  // Add isClockedIn to regular bookings
  const enrichedBookings = bookings.map((b) => ({
    ...b,
    isClockedIn: clockedBookingIds.has(b.id),
  }));

  const allBookings = [...enrichedBookings, ...hmBookings];

  return NextResponse.json({ bookings: allBookings, employees, weekStart: start.toISOString() });
}
