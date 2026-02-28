import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — Clock in/out (job-based)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, lat, lng, bookingId, completeJob } = await req.json();

  if (action === "clock-in") {
    if (!bookingId) {
      return NextResponse.json(
        { error: "You must select a job to clock in" },
        { status: 400 }
      );
    }

    // Check if already clocked in
    const openEntry = await prisma.timeEntry.findFirst({
      where: { employeeId: session.user.id, clockOut: null },
    });

    if (openEntry) {
      return NextResponse.json(
        { error: "Already clocked in" },
        { status: 400 }
      );
    }

    // Create time entry and update booking status to IN_PROGRESS
    const [entry] = await prisma.$transaction([
      prisma.timeEntry.create({
        data: {
          employeeId: session.user.id,
          bookingId,
          clockIn: new Date(),
          clockInLat: lat || null,
          clockInLng: lng || null,
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "IN_PROGRESS" },
      }),
    ]);

    return NextResponse.json({ entry, status: "clocked-in" });
  }

  if (action === "clock-out") {
    const openEntry = await prisma.timeEntry.findFirst({
      where: { employeeId: session.user.id, clockOut: null },
    });

    if (!openEntry) {
      return NextResponse.json(
        { error: "Not clocked in" },
        { status: 400 }
      );
    }

    const clockOut = new Date();
    const hoursWorked =
      (clockOut.getTime() - openEntry.clockIn.getTime()) / (1000 * 60 * 60);

    const entry = await prisma.timeEntry.update({
      where: { id: openEntry.id },
      data: {
        clockOut,
        clockOutLat: lat || null,
        clockOutLng: lng || null,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
      },
    });

    // If employee marks job as completed, update booking status
    if (completeJob && openEntry.bookingId) {
      await prisma.booking.update({
        where: { id: openEntry.bookingId },
        data: { status: "COMPLETED", completedAt: clockOut },
      });
    }

    return NextResponse.json({ entry, status: "clocked-out" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
