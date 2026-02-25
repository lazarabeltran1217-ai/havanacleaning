import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — Clock in/out
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, lat, lng, bookingId } = await req.json();

  if (action === "clock-in") {
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

    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: session.user.id,
        bookingId: bookingId || null,
        clockIn: new Date(),
        clockInLat: lat || null,
        clockInLng: lng || null,
      },
    });

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

    return NextResponse.json({ entry, status: "clocked-out" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
